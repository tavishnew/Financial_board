import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("./.finboard-data");

async function initPGlite(retry = false) {
  try {
    const pglite = new PGlite(DATA_DIR, {
      relaxDurability: true,
    });
    await pglite.waitReady;
    return pglite;
  } catch (error) {
    if (retry) {
      throw error;
    }
    console.warn("PGlite initialization failed, cleaning data directory and retrying...", error);
    // Remove corrupted data directory
    if (fs.existsSync(DATA_DIR)) {
      fs.rmSync(DATA_DIR, { recursive: true, force: true });
    }
    // Retry once with fresh directory
    return initPGlite(true);
  }
}

async function main() {
  console.log("Starting database setup...");
  
  // Create PGlite instance with auto-recovery
  console.log("Creating PGlite instance...");
  const pglite = await initPGlite();
  console.log("PGlite ready");
  const adapter = new PrismaPGlite(pglite);
  const prisma = new PrismaClient({ adapter });

  try {
    // Test if tables exist by querying one
    await prisma.user.findFirst();
    console.log("Database tables already exist");
  } catch (e) {
    // Tables don't exist, try to create them
    console.log("Tables don't exist, attempting to create schema...");
    try {
      // Define all tables
      const tables = [
        `CREATE TABLE IF NOT EXISTS "User" (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          "passwordHash" TEXT,
          name TEXT,
          "avatarUrl" TEXT,
          currency TEXT DEFAULT 'INR',
          "createdAt" TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS "Account" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          balance DECIMAL DEFAULT 0,
          archived BOOLEAN DEFAULT false,
          "createdAt" TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS "Category" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          key TEXT NOT NULL,
          icon TEXT,
          color TEXT,
          "isDefault" BOOLEAN DEFAULT false
        )`,
        `CREATE TABLE IF NOT EXISTS "Transaction" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          "accountId" TEXT NOT NULL REFERENCES "Account"(id) ON DELETE CASCADE,
          "categoryId" TEXT REFERENCES "Category"(id) ON DELETE SET NULL,
          type TEXT NOT NULL,
          amount DECIMAL NOT NULL,
          note TEXT,
          tags TEXT[],
          "receiptUrl" TEXT,
          date TIMESTAMP NOT NULL,
          "createdAt" TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS "Budget" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          "categoryId" TEXT NOT NULL REFERENCES "Category"(id) ON DELETE CASCADE,
          "limit" DECIMAL NOT NULL,
          period TEXT DEFAULT 'monthly',
          "createdAt" TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS "Goal" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          "targetAmount" DECIMAL NOT NULL,
          "currentAmount" DECIMAL DEFAULT 0,
          deadline TIMESTAMP,
          "accountId" TEXT,
          "createdAt" TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS "RecurringTxn" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          amount DECIMAL NOT NULL,
          "categoryId" TEXT REFERENCES "Category"(id) ON DELETE SET NULL,
          frequency TEXT NOT NULL,
          "nextDueDate" TIMESTAMP NOT NULL,
          active BOOLEAN DEFAULT true
        )`,
        `CREATE TABLE IF NOT EXISTS "Holding" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          symbol TEXT NOT NULL,
          name TEXT NOT NULL,
          shares DECIMAL DEFAULT 0,
          "avgCost" DECIMAL DEFAULT 0,
          "createdAt" TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS "Trade" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          "holdingId" TEXT REFERENCES "Holding"(id) ON DELETE CASCADE,
          symbol TEXT NOT NULL,
          type TEXT NOT NULL,
          shares DECIMAL NOT NULL,
          price DECIMAL NOT NULL,
          note TEXT,
          date TIMESTAMP NOT NULL,
          "createdAt" TIMESTAMP DEFAULT NOW()
        )`,
      ];

      for (const sql of tables) {
        await prisma.$executeRawUnsafe(sql);
      }

      // Create indexes
      const indexes = [
        `CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId")`,
        `CREATE INDEX IF NOT EXISTS "Category_userId_idx" ON "Category"("userId")`,
        `CREATE INDEX IF NOT EXISTS "Transaction_userId_date_idx" ON "Transaction"("userId", date)`,
        `CREATE INDEX IF NOT EXISTS "Budget_userId_idx" ON "Budget"("userId")`,
        `CREATE INDEX IF NOT EXISTS "Goal_userId_idx" ON "Goal"("userId")`,
        `CREATE INDEX IF NOT EXISTS "RecurringTxn_userId_idx" ON "RecurringTxn"("userId")`,
        `CREATE INDEX IF NOT EXISTS "Holding_userId_idx" ON "Holding"("userId")`,
        `CREATE INDEX IF NOT EXISTS "Holding_userId_symbol_idx" ON "Holding"("userId", symbol)`,
        `CREATE INDEX IF NOT EXISTS "Trade_userId_idx" ON "Trade"("userId")`,
        `CREATE INDEX IF NOT EXISTS "Trade_holdingId_idx" ON "Trade"("holdingId")`,
      ];

      for (const sql of indexes) {
        await prisma.$executeRawUnsafe(sql);
      }

      console.log("Database schema created successfully");
    } catch (createError) {
      console.error("Failed to create schema:", createError);
      throw createError;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});