// Ensures the PGlite database file + tables exist, and bootstraps a demo
// user with sample data the first time the database is empty.
// Runs automatically on `npm run dev` and via `npm run db:setup`.
import { readFileSync, existsSync, unlinkSync, renameSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// `closing` is set right before we tear the database down. The embedded
// Postgres WASM can emit a benign `RuntimeError: Aborted()` during that
// teardown; we swallow only that specific case so it never blocks startup.
// Every other error fails fast (no more silent hangs).
let closing = false;

const isBenignAbort = (e) => /Aborted\(\)/.test(String((e && e.stack) || e || ""));

const failFatal = (e) => {
  console.error("\n[setup-db] FATAL: database initialization failed.");
  console.error(e && (e.stack || e.message || e));
  console.error(
    "\nLikely cause: the PGlite data directory is corrupt (e.g. a previous\n" +
      "dev process was killed while Postgres was writing the WAL). The setup\n" +
      "script backs the corrupt directory up automatically and re-initializes\n" +
      "a fresh database, so re-running should recover without data loss."
  );
  process.exit(1);
};

// Open (and wait for ready) a PGlite database. Rejects if the data directory
// is unopenable — e.g. a torn WAL checkpoint — so the caller can recover.
async function openPglite(dbPath) {
  const instance = new PGlite(dbPath);
  await instance.waitReady;
  return instance;
}

process.on("uncaughtException", (e) => {
  if (closing && isBenignAbort(e)) return; // benign teardown abort only
  failFatal(e);
});
process.on("unhandledRejection", (e) => {
  if (closing && isBenignAbort(e)) return; // benign teardown abort only
  failFatal(e);
});

const raw = readFileSync(new URL("../prisma/schema.sql", import.meta.url), "utf8");
const statements = raw
  .split(";")
  .map((s) => s.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n"))
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

// Seed a few demo holdings + their opening buy trades for the demo user, but
// only when that user has no holdings yet (so re-runs never duplicate them).
async function ensureDemoHoldings(prisma) {
  const user = await prisma.user.findUnique({ where: { email: "tavis@finance.app" } });
  if (!user) return;
  const count = await prisma.holding.count({ where: { userId: user.id } });
  if (count > 0) return;
  const seed = [
    { symbol: "AAPL", name: "Apple Inc.", shares: 12, avgCost: 175.2 },
    { symbol: "MSFT", name: "Microsoft Corp.", shares: 8, avgCost: 320.5 },
    { symbol: "NVDA", name: "NVIDIA Corp.", shares: 15, avgCost: 95.4 },
    { symbol: "TSLA", name: "Tesla Inc.", shares: 5, avgCost: 210.0 },
  ];
  for (const s of seed) {
    const holding = await prisma.holding.create({
      data: { userId: user.id, symbol: s.symbol, name: s.name, shares: s.shares, avgCost: s.avgCost },
    });
    await prisma.trade.create({
      data: {
        userId: user.id,
        holdingId: holding.id,
        symbol: s.symbol,
        type: "buy",
        shares: s.shares,
        price: s.avgCost,
        note: "Opening position",
        date: new Date(),
      },
    });
  }
  console.log("seeded demo holdings for tavis@finance.app");
}

const path =
  process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("://")
    ? process.env.DATABASE_URL
    : "./.finboard-data";

// PGlite records a postmaster.pid whose PID is the WASM sentinel (-42), which
// is never a real OS process. When setup-db exits via `process.exit(0)`, the
// WASM teardown can abort and leave that pid file behind. On the next run
// PGlite sees it, thinks a server is still alive, and blocks forever — so
// `next dev` never starts. Remove the pid file when its recorded PID is not a
// live process (always true for the -42 sentinel).
const pidFile = join(path, "postmaster.pid");
if (existsSync(pidFile)) {
  try {
    const pid = parseInt(readFileSync(pidFile, "utf8").split("\n")[0], 10);
    const stale = Number.isNaN(pid) || pid <= 0 || !process.kill(pid, 0);
    if (stale) {
      unlinkSync(pidFile);
      console.log("removed stale postmaster.pid");
    }
  } catch {
    // Leave the file alone if we can't read/parse it.
  }
}

let db;
try {
  db = await openPglite(path);
} catch (e) {
  // The existing data directory could not be opened — almost always a corrupt
  // WAL left behind when a previous dev process was killed mid-write. Back the
  // corrupt directory up (so nothing is destroyed) and re-initialize a fresh
  // database; the seed block below repopulates it.
  console.error(`[setup-db] could not open "${path}" (${(e && e.message) || e}).`);
  let recovered = false;
  if (existsSync(path)) {
    const backup = `${path}.corrupt-${Date.now()}`;
    try {
      renameSync(path, backup);
      console.error(`[setup-db] moved corrupt data directory to "${backup}".`);
      recovered = true;
    } catch (moveErr) {
      console.error(`[setup-db] could not move corrupt directory: ${moveErr?.message || moveErr}`);
    }
  }
  try {
    db = await openPglite(path); // fresh initdb
    if (recovered) console.log(`reinitialized fresh database at "${path}"`);
  } catch (e2) {
    failFatal(e2);
  }
}

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

// Idempotently create the investments tables (Holdings / Trades) added after
// the original launch. Runs only when the tables are missing so it is safe to
// execute on every startup against an already-populated database.
const holdingCheck = await db.query(`SELECT to_regclass('"Holding"') AS t`);
if (!holdingCheck.rows[0].t) {
  for (const stmt of statements) {
    if (/Holding|Trade/.test(stmt)) {
      try {
        await db.exec(stmt);
      } catch (e) {
        console.error("HOLDINGS STATEMENT FAILED:\n" + stmt + "\nERROR: " + (e?.message || e));
        process.exit(1);
      }
    }
  }
  console.log("holdings + trades tables created");
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

// Ensure the demo user has sample holdings (idempotent: only when empty).
await ensureDemoHoldings(prisma);

try {
  await prisma.$disconnect();
} catch {}
closing = true; // subsequent benign WASM teardown aborts are expected
try {
  await db.close();
} catch {}
// Force a clean exit so `npm run dev` (setup && next dev) proceeds and no
// process is left hanging.
process.exit(0);
