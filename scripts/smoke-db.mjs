// Task 0 spike: validate Prisma + PGlite via pglite-prisma-adapter.
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@prisma/client";

const raw = readFileSync(new URL("../prisma/schema.sql", import.meta.url), "utf8");
// Split into individual statements (no ';' appears inside these DDL literals),
// and strip Prisma's leading "-- Comment" lines so the SQL survives.
const statements = raw
  .split(";")
  .map((s) => s.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n"))
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

const db = new PGlite("./.finboard-data");
await db.waitReady;

// Ensure schema exists (idempotent per-statement).
const { rows } = await db.query(`SELECT to_regclass('"User"') AS t`);
if (!rows[0].t) {
  for (const stmt of statements) {
    try {
      await db.exec(stmt);
    } catch (e) {
      console.error("STATEMENT FAILED:\n" + stmt + "\nERROR: " + (e?.message || e));
      process.exit(1);
    }
  }
  console.log("schema created (" + statements.length + " statements)");
} else {
  console.log("schema already present");
}

const adapter = new PrismaPGlite(db);
const prisma = new PrismaClient({ adapter });

const email = `smoke-${Date.now()}@x.com`;
const u = await prisma.user.create({
  data: { email, passwordHash: "x", name: "Smoke", currency: "USD" },
});
console.log("OK created", u.id);

const found = await prisma.user.findUnique({ where: { email } });
console.log("OK found", found?.email);

await prisma.user.delete({ where: { id: u.id } });
console.log("OK deleted");

await prisma.$disconnect();
await db.close();
