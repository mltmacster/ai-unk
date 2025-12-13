import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { AI_UNK_SYSTEM_PROMPT } from "../shared/aiUnkPrompt";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Conversation management
  conversations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getConversationsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({ title: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const conversationId = await db.createConversation({
          userId: ctx.user.id,
          title: input.title,
        });

        // Log the event
        await db.createAuditLog({
          eventType: 'conversation_created',
          userId: ctx.user.id,
          details: { conversationId },
        });

        return { conversationId };
      }),

    delete: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getConversationById(input.conversationId);
        
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your conversation' });
        }

        await db.deleteConversation(input.conversationId);

        // Log the event
        await db.createAuditLog({
          eventType: 'conversation_deleted',
          userId: ctx.user.id,
          details: { conversationId: input.conversationId },
        });

        return { success: true };
      }),

    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const conversation = await db.getConversationById(input.conversationId);
        
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your conversation' });
        }

        return await db.getMessagesByConversationId(input.conversationId);
      }),
  }),

  // Chat functionality
  chat: router({
    send: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getConversationById(input.conversationId);
        
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your conversation' });
        }

        // Save user message
        await db.createMessage({
          conversationId: input.conversationId,
          sender: 'user',
          content: input.message,
        });

        // Get conversation history (last 10 messages)
        const history = await db.getMessagesByConversationId(input.conversationId, 10);

        // Build messages for LLM
        const messages = [
          { role: 'system' as const, content: AI_UNK_SYSTEM_PROMPT },
          ...history.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content as string,
          })),
        ];

        // Get active AI provider
        const activeProvider = await db.getActiveProvider();

        try {
          // Call LLM
          const response = await invokeLLM({ messages });
          const messageContent = response.choices[0]?.message?.content;
          
          // Extract text from content (handle both string and array formats)
          let aiResponse: string;
          if (typeof messageContent === 'string') {
            aiResponse = messageContent;
          } else if (Array.isArray(messageContent)) {
            const textParts = messageContent.filter(part => part.type === 'text');
            aiResponse = textParts.map(part => 'text' in part ? part.text : '').join('');
          } else {
            aiResponse = "I'm having trouble responding right now, lil' nephew. Try again in a moment.";
          }

          // Save AI response
          await db.createMessage({
            conversationId: input.conversationId,
            sender: 'ai_unk',
            content: aiResponse,
            aiProvider: activeProvider?.providerId || 'default',
            aiModel: activeProvider?.model || 'default',
            tokensUsed: response.usage?.total_tokens,
          });

          // Update conversation
          await db.updateConversation(input.conversationId, {
            messageCount: conversation.messageCount + 2,
            updatedAt: new Date(),
          });

          // Increment provider usage
          if (activeProvider) {
            await db.incrementProviderUsage(activeProvider.providerId);
          }

          // Log the chat event
          await db.createAuditLog({
            eventType: 'chat',
            userId: ctx.user.id,
            details: {
              conversationId: input.conversationId,
              provider: activeProvider?.providerId,
              tokensUsed: response.usage?.total_tokens,
            },
          });

          return { response: aiResponse };
        } catch (error) {
          // Log error
          await db.createAuditLog({
            eventType: 'error',
            userId: ctx.user.id,
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
              conversationId: input.conversationId,
            },
          });

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to get AI response',
          });
        }
      }),
  }),

  // User progress tracking
  progress: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      let progress = await db.getUserProgress(ctx.user.id);
      
      if (!progress) {
        // Initialize progress for new users
        await db.upsertUserProgress({
          userId: ctx.user.id,
          totalConversations: 0,
          totalMessages: 0,
          topicsDiscussed: [],
          achievements: [],
        });
        progress = await db.getUserProgress(ctx.user.id);
      }
      
      return progress;
    }),

    update: protectedProcedure
      .input(z.object({
        totalConversations: z.number().optional(),
        totalMessages: z.number().optional(),
        topicsDiscussed: z.array(z.string()).optional(),
        achievements: z.array(z.string()).optional(),
        lastTopic: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUserProgress({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // Admin panel
  admin: router({
    // Get all provider settings
    providers: adminProcedure.query(async () => {
      return await db.getAllProviders();
    }),

    // Update provider settings
    updateProvider: adminProcedure
      .input(z.object({
        providerId: z.string(),
        model: z.string(),
        apiKey: z.string(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertProviderSettings(input);

        // Log the provider switch
        await db.createAuditLog({
          eventType: 'provider_switched',
          userId: ctx.user.id,
          details: {
            providerId: input.providerId,
            model: input.model,
            isActive: input.isActive,
          },
        });

        return { success: true };
      }),

    // Test provider connection
    testProvider: adminProcedure
      .input(z.object({
        providerId: z.string(),
        model: z.string(),
        apiKey: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const startTime = Date.now();
        
        try {
          // Test with a simple message
          await invokeLLM({
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: 'Say "test successful" if you can read this.' },
            ],
          });

          const latency = Date.now() - startTime;

          // Log the test
          await db.createAuditLog({
            eventType: 'provider_test',
            userId: ctx.user.id,
            details: {
              providerId: input.providerId,
              model: input.model,
              success: true,
              latency,
            },
          });

          return {
            success: true,
            message: 'Provider connection successful',
            latencyMs: latency,
          };
        } catch (error) {
          // Log the failed test
          await db.createAuditLog({
            eventType: 'provider_test',
            userId: ctx.user.id,
            details: {
              providerId: input.providerId,
              model: input.model,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });

          return {
            success: false,
            message: error instanceof Error ? error.message : 'Connection failed',
            latencyMs: Date.now() - startTime,
          };
        }
      }),

    // Get audit logs
    auditLogs: adminProcedure
      .input(z.object({
        limit: z.number().default(100),
        eventType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAuditLogs(input.limit, input.eventType);
      }),
  }),
});

export type AppRouter = typeof appRouter;
