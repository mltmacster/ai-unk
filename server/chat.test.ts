import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Conversation Management", () => {
  it("should create a new conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.conversations.create({ title: "Test Conversation" });

    expect(result).toHaveProperty("conversationId");
    expect(typeof result.conversationId).toBe("number");
  });

  it("should list user conversations", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a conversation first
    await caller.conversations.create({ title: "Test Conversation" });

    const conversations = await caller.conversations.list();

    expect(Array.isArray(conversations)).toBe(true);
    expect(conversations.length).toBeGreaterThan(0);
  });

  it("should get messages for a conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a conversation
    const { conversationId } = await caller.conversations.create({ title: "Test Conversation" });

    // Get messages (should be empty initially)
    const messages = await caller.conversations.getMessages({ conversationId });

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBe(0);
  });

  it("should delete a conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a conversation
    const { conversationId } = await caller.conversations.create({ title: "Test to Delete" });

    // Delete it
    const result = await caller.conversations.delete({ conversationId });

    expect(result.success).toBe(true);
  });

  it("should not allow deleting another user's conversation", async () => {
    const ctx1 = createAuthContext();
    const caller1 = appRouter.createCaller(ctx1);

    // Create conversation as user 1
    const { conversationId } = await caller1.conversations.create({ title: "User 1 Conversation" });

    // Try to delete as user 2
    const ctx2 = createAuthContext();
    ctx2.user!.id = 2;
    ctx2.user!.openId = "test-user-2";
    const caller2 = appRouter.createCaller(ctx2);

    await expect(caller2.conversations.delete({ conversationId })).rejects.toThrow();
  });
});

describe("User Progress", () => {
  it("should get user progress", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const progress = await caller.progress.get();

    expect(progress).toBeDefined();
    expect(progress).toHaveProperty("userId");
    expect(progress).toHaveProperty("totalConversations");
    expect(progress).toHaveProperty("totalMessages");
  });

  it("should update user progress", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.update({
      totalConversations: 5,
      totalMessages: 20,
      topicsDiscussed: ["Python", "JavaScript"],
    });

    expect(result.success).toBe(true);
  });
});

describe("Admin Functions", () => {
  it("should allow admin to access provider settings", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const providers = await caller.admin.providers();

    expect(Array.isArray(providers)).toBe(true);
  });

  it("should not allow non-admin to access provider settings", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.providers()).rejects.toThrow("Admin access required");
  });

  it("should allow admin to get audit logs", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const logs = await caller.admin.auditLogs({ limit: 10 });

    expect(Array.isArray(logs)).toBe(true);
  });
});

describe("Database Helpers", () => {
  it("should create and retrieve conversation", async () => {
    const conversationId = await db.createConversation({
      userId: 1,
      title: "Test DB Conversation",
    });

    expect(typeof conversationId).toBe("number");

    const conversation = await db.getConversationById(conversationId);
    expect(conversation).toBeDefined();
    expect(conversation?.title).toBe("Test DB Conversation");
  });

  it("should create and retrieve messages", async () => {
    const conversationId = await db.createConversation({
      userId: 1,
      title: "Test Messages",
    });

    await db.createMessage({
      conversationId,
      sender: "user",
      content: "Hello AI Unk!",
    });

    const messages = await db.getMessagesByConversationId(conversationId);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].content).toBe("Hello AI Unk!");
  });

  it("should handle user progress", async () => {
    await db.upsertUserProgress({
      userId: 999,
      totalConversations: 3,
      totalMessages: 15,
      topicsDiscussed: ["Testing"],
      achievements: ["First Test"],
    });

    const progress = await db.getUserProgress(999);
    expect(progress).toBeDefined();
    expect(progress?.totalConversations).toBe(3);
    expect(progress?.topicsDiscussed).toContain("Testing");
  });

  it("should create audit log entries", async () => {
    await db.createAuditLog({
      eventType: "test_event",
      userId: 1,
      details: { test: true },
    });

    const logs = await db.getAuditLogs(10, "test_event");
    expect(logs.length).toBeGreaterThan(0);
  });
});
