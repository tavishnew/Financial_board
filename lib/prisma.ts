import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pglite: PGlite | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  // Local PGlite (no "://") -> use embedded PGlite with adapter
  if (databaseUrl && !databaseUrl.includes("://")) {
    const pglite = globalForPrisma.pglite ?? new PGlite(databaseUrl);
    if (process.env.NODE_ENV !== "production") globalForPrisma.pglite = pglite;
    const adapter = new PrismaPGlite(pglite);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }

  // PostgreSQL URL (postgresql:// or postgres://) -> standard Prisma client
  if (databaseUrl?.startsWith("postgres")) {
    const prisma = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
    return prisma;
  }

  // Default: PGlite at ./.finboard-data
  const pglite = globalForPrisma.pglite ?? new PGlite("./.finboard-data");
  if (process.env.NODE_ENV !== "production") globalForPrisma.pglite = pglite;
  const adapter = new PrismaPGlite(pglite);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = createPrismaClient();