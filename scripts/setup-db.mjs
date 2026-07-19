// Ensures the PGlite database file + tables exist, and bootstraps a demo
// user with sample data the first time the database is empty.
// Runs automatically on `npm run dev` and via `npm run db:setup`.
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const raw = readFileSync(new URL("../prisma/schema.sql", import.meta.url), "utf8");
const statements = raw
  .split(";")
  .map((s) => s.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n"))
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

const path =
  process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("://")
    ? process.env.DATABASE_URL
    : "./.finboard-data";

const db = new PGlite(path);
await db.waitReady;

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
  console.log("schema created");
} else {
  console.log("schema already present");
}

const adapter = new PrismaPGlite(db);
const prisma = new PrismaClient({ adapter });

const userCount = await prisma.user.count();
if (userCount === 0) {
  const passwordHash = await bcrypt.hash("Password1!", 10);
  const user = await prisma.user.create({
    data: { email: "tavis@finance.app", name: "Tavis", passwordHash, currency: "INR" },
  });

  const accounts = await Promise.all([
    prisma.account.create({ data: { id: "acc-salary", userId: user.id, name: "Salary Account", type: "bank", balance: 184250 } }),
    prisma.account.create({ data: { id: "acc-wallet", userId: user.id, name: "Wallet", type: "cash", balance: 4200 } }),
    prisma.account.create({ data: { id: "acc-sapphire", userId: user.id, name: "Sapphire Card", type: "card", balance: -18200 } }),
    prisma.account.create({ data: { id: "acc-savings", userId: user.id, name: "Emergency Fund", type: "bank", balance: 96000 } }),
  ]);

  const catKeys = ["food", "transport", "shopping", "bills", "fun", "health", "savings"];
  const categories = await Promise.all(
    catKeys.map((key) =>
      prisma.category.create({
        data: { id: `cat-${key}`, userId: user.id, key, name: key[0].toUpperCase() + key.slice(1), isDefault: true },
      })
    )
  );
  const catId = (k) => `cat-${k}`;

  const now = new Date();
  const day = (back) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back, 10, 0, 0);
    return d;
  };
  const txn = [
    { type: "income", amount: 145000, categoryId: catId("savings"), accountId: "acc-salary", note: "Monthly salary", date: day(18) },
    { type: "expense", amount: 1200, categoryId: catId("food"), accountId: "acc-wallet", note: "Groceries", date: day(15) },
    { type: "expense", amount: 2490, categoryId: catId("bills"), accountId: "acc-sapphire", note: "Electricity", date: day(12) },
    { type: "expense", amount: 3990, categoryId: catId("shopping"), accountId: "acc-sapphire", note: "Shoes", date: day(9) },
    { type: "expense", amount: 3010, categoryId: catId("fun"), accountId: "acc-wallet", note: "Concert", date: day(6) },
    { type: "expense", amount: 1910, categoryId: catId("health"), accountId: "acc-wallet", note: "Pharmacy", date: day(4) },
    { type: "expense", amount: 310, categoryId: catId("transport"), accountId: "acc-wallet", note: "Metro", date: day(2) },
    { type: "expense", amount: 10500, categoryId: catId("savings"), accountId: "acc-savings", note: "SIP", date: day(1) },
  ];
  for (const t of txn) {
    await prisma.transaction.create({ data: { userId: user.id, ...t, tags: [] } });
  }

  await prisma.budget.create({ data: { userId: user.id, categoryId: catId("food"), limit: 8000, period: "monthly" } });
  await prisma.budget.create({ data: { userId: user.id, categoryId: "cat-bills", limit: 6000, period: "monthly" } });
  await prisma.budget.create({ data: { userId: user.id, categoryId: "cat-shopping", limit: 5000, period: "monthly" } });

  await prisma.goal.create({ data: { userId: user.id, name: "Japan Trip", targetAmount: 250000, currentAmount: 64000, deadline: new Date(now.getFullYear(), now.getMonth() + 5, 1) } });
  await prisma.goal.create({ data: { userId: user.id, name: "New Laptop", targetAmount: 120000, currentAmount: 38500 } });

  console.log("seeded demo user: tavis@finance.app / Password1!");
} else {
  console.log("database already has users; skipping seed");
}

await prisma.$disconnect();
await db.close();
