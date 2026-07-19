import { PrismaClient } from "@prisma/client";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Neon / any real Postgres URL -> standard Prisma client (prod).
function isNeon(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

// Local dev uses PGlite (zero-config, embedded Postgres). DATABASE_URL, when
// set to a non-URL path, is treated as the on-disk location; otherwise we
// default to ./.finboard-data. Tables are created by scripts/setup-db.mjs.
function pglitePath(): string {
  const url = process.env.DATABASE_URL ?? "";
  if (isNeon()) return "";
  if (url && !url.includes("://")) return url;
  return ".finboard-data";
}

function createClient(): PrismaClient {
  if (isNeon()) {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  const pglite = new PGlite(pglitePath());
  const adapter = new PrismaPGlite(pglite);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
