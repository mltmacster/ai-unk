import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role for admin access control.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversations table - tracks chat sessions
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  messageCount: int("messageCount").default(0).notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table - stores individual chat messages
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  sender: mysqlEnum("sender", ["user", "ai_unk"]).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  aiProvider: varchar("aiProvider", { length: 64 }),
  aiModel: varchar("aiModel", { length: 128 }),
  tokensUsed: int("tokensUsed"),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * User progress tracking
 */
export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalConversations: int("totalConversations").default(0).notNull(),
  totalMessages: int("totalMessages").default(0).notNull(),
  topicsDiscussed: json("topicsDiscussed").$type<string[]>(),
  achievements: json("achievements").$type<string[]>(),
  lastTopic: text("lastTopic"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * AI provider settings for admin management
 */
export const aiProviderSettings = mysqlTable("aiProviderSettings", {
  id: int("id").autoincrement().primaryKey(),
  providerId: varchar("providerId", { length: 64 }).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  apiKey: text("apiKey").notNull(),
  isActive: boolean("isActive").default(false).notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  lastUsed: timestamp("lastUsed"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiProviderSetting = typeof aiProviderSettings.$inferSelect;
export type InsertAiProviderSetting = typeof aiProviderSettings.$inferInsert;

/**
 * Audit log for tracking system events
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  userId: int("userId"),
  details: json("details").$type<Record<string, any>>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;
