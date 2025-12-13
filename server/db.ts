import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  conversations, 
  messages, 
  userProgress, 
  aiProviderSettings, 
  auditLog,
  InsertConversation,
  InsertMessage,
  InsertUserProgress,
  InsertAiProviderSetting,
  InsertAuditLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Conversation helpers
export async function createConversation(data: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(conversations).values(data);
  return result[0].insertId;
}

export async function getConversationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateConversation(id: number, data: Partial<InsertConversation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(conversations).set(data).where(eq(conversations.id, id));
}

export async function deleteConversation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete messages first
  await db.delete(messages).where(eq(messages.conversationId, id));
  // Then delete conversation
  await db.delete(conversations).where(eq(conversations.id, id));
}

// Message helpers
export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(data);
  return result[0].insertId;
}

export async function getMessagesByConversationId(conversationId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(desc(messages.timestamp));
  
  if (limit) {
    query = query.limit(limit) as any;
  }
  
  const result = await query;
  return result.reverse(); // Return in chronological order
}

// User progress helpers
export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserProgress(data: InsertUserProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserProgress(data.userId);
  
  if (existing) {
    await db.update(userProgress).set(data).where(eq(userProgress.userId, data.userId));
  } else {
    // Set defaults for JSON fields if not provided
    const values = {
      ...data,
      topicsDiscussed: data.topicsDiscussed || [],
      achievements: data.achievements || [],
    };
    await db.insert(userProgress).values(values);
  }
}

// AI provider settings helpers
export async function getActiveProvider() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(aiProviderSettings).where(eq(aiProviderSettings.isActive, true)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProviders() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(aiProviderSettings);
}

export async function upsertProviderSettings(data: InsertAiProviderSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // If setting this provider as active, deactivate all others
  if (data.isActive) {
    await db.update(aiProviderSettings).set({ isActive: false });
  }
  
  const existing = await db.select().from(aiProviderSettings)
    .where(eq(aiProviderSettings.providerId, data.providerId))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(aiProviderSettings)
      .set(data)
      .where(eq(aiProviderSettings.providerId, data.providerId));
  } else {
    await db.insert(aiProviderSettings).values(data);
  }
}

export async function incrementProviderUsage(providerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const provider = await db.select().from(aiProviderSettings)
    .where(eq(aiProviderSettings.providerId, providerId))
    .limit(1);
  
  if (provider.length > 0) {
    await db.update(aiProviderSettings)
      .set({ 
        usageCount: provider[0].usageCount + 1,
        lastUsed: new Date()
      })
      .where(eq(aiProviderSettings.providerId, providerId));
  }
}

// Audit log helpers
export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(auditLog).values(data);
}

export async function getAuditLogs(limit: number = 100, eventType?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(auditLog);
  
  if (eventType) {
    query = query.where(eq(auditLog.eventType, eventType)) as any;
  }
  
  return await query.orderBy(desc(auditLog.timestamp)).limit(limit);
}
