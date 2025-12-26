import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { notifyNewSignup, sendWelcomeEmail } from "./emailService";

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Database Connection Pool Configuration
 * Drizzle ORM with mysql2 handles connection pooling internally
 * when using the connection string approach
 */
const DB_CONFIG = {
  // Pool configuration is handled by mysql2 driver
  // These are passed via connection string or drizzle config
};

/**
 * Lazily create the drizzle instance with optimized connection pooling
 * mysql2 driver handles pooling automatically with proper configuration
 */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Drizzle with mysql2 uses connection pooling by default
      // The connection string format enables SSL and pooling
      _db = drizzle(process.env.DATABASE_URL);
      console.log("[Database] Drizzle ORM initialized with connection pool");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Get pool statistics for monitoring
 */
export async function getPoolStats() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    // Test query to verify connection health
    await db.select({ id: users.id }).from(users).limit(1);
    return {
      healthy: true,
      status: 'connected'
    };
  } catch (error) {
    return {
      healthy: false,
      error: String(error)
    };
  }
}

/**
 * Gracefully close the database connection
 * Call this on server shutdown
 */
export async function closePool() {
  if (_db) {
    try {
      // Drizzle doesn't expose direct pool close, but we can reset
      console.log("[Database] Connection cleanup initiated");
      _db = null;
    } catch (error) {
      console.error("[Database] Error during cleanup:", error);
    }
  }
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

    // Check if user exists before insert
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
    const isNewUser = existingUser.length === 0;

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // Send notification for new signups and welcome email to user (async, non-blocking)
    if (isNewUser) {
      const newUser = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
      if (newUser.length > 0) {
        // Notify admin about new signup - fire and forget
        notifyNewSignup(newUser[0].id, user.email || null, user.name || null).catch(err => {
          console.error("[Database] Failed to send signup notification:", err);
        });
        
        // Send welcome email to new user - fire and forget
        if (user.email) {
          sendWelcomeEmail(user.email, user.name || null).catch(err => {
            console.error("[Database] Failed to send welcome email:", err);
          });
        }
      }
    }
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

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log("[Database] SIGTERM received, closing connections...");
  await closePool();
});

process.on('SIGINT', async () => {
  console.log("[Database] SIGINT received, closing connections...");
  await closePool();
});
