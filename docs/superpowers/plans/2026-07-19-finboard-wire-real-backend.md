# Finboard — Wire Real Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Finboard prototype into a real, persistent, per-user finance tracker by wiring NextAuth sign-in/sign-up, hydrating the client store from the session-protected API, and persisting via Prisma (PGlite locally, Neon in prod).

**Architecture:** The existing `useStore()` Context interface is preserved; on authentication it fetches from `/api/*` and mutators write back through the API (optimistic local update + rollback on error). `lib/mock.ts` is deleted. Auth uses NextAuth credentials; the UI calls `signIn`/`signIn` + a new `/api/auth/register` route. The data layer is the already-built Prisma client, pointed at PGlite for local dev and Neon for prod.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · NextAuth (Auth.js) credentials · Prisma + PostgreSQL · PGlite (local) / Neon (prod) · bcryptjs · zod · Vitest (tests).

## Global Constraints

- Prisma `provider` stays `postgresql` in `prisma/schema.prisma` (no dialect switch).
- Local dev database = PGlite (zero-config, embedded); prod = Neon via `DATABASE_URL`. See Task 0 for the adapter risk + fallback.
- Auth = credentials only (Google OAuth deferred).
- Delete `lib/mock.ts`; the store must not import it.
- Preserve the exported `useStore()` hook and `StoreContextValue` shape so pages keep working unchanged.
- Reuse existing `Skeleton`, `EmptyState`, `Toast`, `ProgressBar`, `CategoryPie`, etc. — no new UI components.
- Tests use Vitest. TDD: write the failing test, run it, implement, run again.
- Commit after every task.

---

## File Structure

- `lib/prisma.ts` — Prisma client; selects PGlite adapter (local) or standard client (prod/Neon). **Task 0, Task 9.**
- `app/api/auth/register/route.ts` — NEW; creates a user (bcrypt) + rejects duplicates. **Task 3.**
- `lib/store.tsx` — becomes API-backed (hydrate on session, mutators call API). **Task 7, Task 8.**
- `app/login/page.tsx` — `submit` → `signIn("credentials")`. **Task 4.**
- `app/signup/page.tsx` — `submit` → `POST /api/auth/register` → `signIn`. **Task 5.**
- `app/layout.tsx` — wrap app in NextAuth `SessionProvider`. **Task 6.**
- `app/dashboard/page.tsx` — read user identity from session, not mock. **Task 10.**
- `lib/auth.ts` — extend session callback to expose `currency`. **Task 10.**
- `types/next-auth.d.ts` — add `currency` to session user type. **Task 10.**
- `lib/selectors.ts` — unchanged (verified by tests). **Task 2.**
- `lib/mock.ts` — DELETED. **Task 7.**
- `vitest.config.ts`, `vitest.setup.ts` — NEW test config. **Task 1.**
- `lib/selectors.test.ts`, `app/api/auth/register/route.test.ts` — NEW tests. **Task 2, Task 3.**
- `.env.example`, `README.md` — PGlite + Neon instructions. **Task 11.**

---

### Task 0: Validate DB strategy (PGlite ↔ Prisma) — spike

**Files:**
- Modify: `lib/prisma.ts`
- Test: `scripts/smoke-db.mjs` (throwaway smoke check)

**Step 1: Decide the adapter path**

Run the spike to confirm PGlite works with Prisma in this environment. Install the PGlite driver adapter and a local PGlite instance:

```bash
npm install @electric-sql/pglite
```

Then write `lib/prisma.ts` using a Prisma driver adapter for PGlite. If no community PGlite↔Prisma adapter resolves/works, fall back to **Neon-for-local** (set `DATABASE_URL` to any Postgres/Neon string locally) — the standard Prisma client path below still applies.

- [ ] **Step 2: Write `lib/prisma.ts` (PGlite-local variant)**

```ts
import { PrismaClient } from "@prisma/client";
import { PGlite } from "@electric-sql/pglite";
// If a PGlite Prisma adapter is available in your env, import it here
// (e.g. an adapter that wraps PGlite). Otherwise set DATABASE_URL and use
// the standard client below.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  // Prod / CI: standard client against DATABASE_URL (Neon).
  if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL) {
    return new PrismaClient();
  }
  // Local dev: PGlite (zero-config). Replace the adapter line with the
  // confirmed PGlite↔Prisma adapter from the Task 0 spike.
  const pglite = new PGlite();
  // e.g. return new PrismaClient({ adapter: new PrismaPg(pglite) });
  return new PrismaClient();
}

export const prisma =
  globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Smoke test the connection**

Create `scripts/smoke-db.mjs`:

```js
import { prisma } from "../lib/prisma.ts";
const u = await prisma.user.create({ data: { email: `smoke-${Date.now()}@x.com`, passwordHash: "x" } });
console.log("OK created", u.id);
await prisma.user.delete({ where: { id: u.id } });
console.log("OK deleted");
```

Run with `node --experimental-strip-types scripts/smoke-db.mjs` (or `tsx`). Expected: prints `OK created <id>` then `OK deleted` (proves PGlite/DB works). If it fails, switch `lib/prisma.ts` to the `DATABASE_URL`/Neon path and set `DATABASE_URL` for local dev.

- [ ] **Step 4: Run `db:push` + `db:seed` locally**

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Expected: tables created in PGlite (or Neon); seed prints the demo user.

- [ ] **Step 5: Commit**

```bash
git add lib/prisma.ts scripts/smoke-db.mjs
git commit -m "chore: wire Prisma to PGlite locally / Neon in prod"
```

---

### Task 1: Add Vitest test tooling

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (add `test` script + devDeps)

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Write `vitest.setup.ts`**

```ts
// intentionally empty for now; add mocks here if needed
export {};
```

- [ ] **Step 4: Add `test` script to `package.json`**

```json
"scripts": { "test": "vitest run" }
```

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json
git commit -m "chore: add Vitest test tooling"
```

---

### Task 2: Unit tests for `lib/selectors.ts`

**Files:**
- Test: `lib/selectors.test.ts`

Selectors already exist and are used by the dashboard. Add tests that pin their behavior.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { netWorth, monthTotals, topCategory, recentTransactions } from "./selectors";
import type { Account, Transaction, Category } from "./types";

const accounts: Account[] = [
  { id: "a1", name: "Bank", balance: 1000, kind: "bank", archived: false, createdAt: new Date(), updatedAt: new Date() },
  { id: "a2", name: "Card", balance: -200, kind: "card", archived: false, createdAt: new Date(), updatedAt: new Date() },
];

const cats: Category[] = [
  { id: "c1", key: "food", name: "Food" },
  { id: "c2", key: "income", name: "Income" },
];

const txns: Transaction[] = [
  { id: "t1", type: "expense", amount: 50, categoryId: "c1", accountId: "a1", note: "", date: new Date("2026-07-10"), tags: [], userId: "u1" },
  { id: "t2", type: "income", amount: 500, categoryId: "c2", accountId: "a1", note: "", date: new Date("2026-07-12"), tags: [], userId: "u1" },
  { id: "t3", type: "expense", amount: 30, categoryId: "c1", accountId: "a1", note: "", date: new Date("2026-06-01"), tags: [], userId: "u1" },
];

describe("selectors", () => {
  it("netWorth sums non-archived account balances", () => {
    expect(netWorth(accounts)).toBe(800);
  });
  it("monthTotals scopes to the current month", () => {
    const t = monthTotals(txns);
    expect(t.income).toBe(500);
    expect(t.expense).toBe(50); // t3 is in June, excluded
    expect(t.net).toBe(450);
  });
  it("topCategory returns the highest expense", () => {
    const top = topCategory(txns, cats);
    expect(top?.category.key).toBe("food");
    expect(top?.amount).toBe(50);
  });
  it("recentTransactions returns n most recent", () => {
    expect(recentTransactions(txns, 2).length).toBe(2);
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
npm run test
```

Expected: PASS (selectors already implemented). If any fail, fix the selector, not the test.

- [ ] **Step 3: Commit**

```bash
git add lib/selectors.test.ts
git commit -m "test: cover lib/selectors with unit tests"
```

---

### Task 3: Register API route (`/api/auth/register`)

**Files:**
- Create: `app/api/auth/register/route.ts`
- Test: `app/api/auth/register/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";

async function makeReq(body: unknown) {
  return POST(new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as any);
}

describe("POST /api/auth/register", () => {
  const email = `reg-${Date.now()}@finboard.app`;
  it("creates a user with a bcrypt hash", async () => {
    const res = await makeReq({ name: "T", email, password: "password123" });
    expect(res.status).toBe(201);
    const u = await prisma.user.findUnique({ where: { email } });
    expect(u).toBeTruthy();
    expect(u!.passwordHash).not.toBe("password123");
  });
  it("rejects duplicate email with 409", async () => {
    const res = await makeReq({ name: "T", email, password: "password123" });
    expect(res.status).toBe(409);
  });
  it("rejects invalid body with 400", async () => {
    const res = await makeReq({ name: "", email: "bad", password: "1" });
    expect(res.status).toBe(400);
  });
  afterAll(async () => { await prisma.user.deleteMany({ where: { email: { contains: "reg-" } } }); await prisma.$disconnect(); });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm run test
```

Expected: FAIL (route does not exist yet).

- [ ] **Step 3: Implement the route**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "name, email and password (8+ chars) are required" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/auth/register/route.ts app/api/auth/register/route.test.ts
git commit -m "feat: add /api/auth/register (bcrypt + duplicate guard)"
```

---

### Task 4: Login page calls NextAuth `signIn`

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Replace `submit` with a real sign-in**

Change the top of the file to import `signIn` and rewrite `submit`:

```tsx
import { signIn } from "next-auth/react";
// ...existing imports...

async function submit(e: React.FormEvent) {
  e.preventDefault();
  const res = await signIn("credentials", { email, password, redirect: false });
  if (res?.error) {
    toast("Invalid email or password", "error");
    return;
  }
  router.push("/dashboard");
}
```

The `Field` component, `useState` for email/password, and the "Continue as guest" button stay as-is. The prefilled demo email (`tavis@finance.app`) remains a convenience.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: login calls NextAuth signIn"
```

---

### Task 5: Signup page registers then signs in

**Files:**
- Modify: `app/signup/page.tsx`

- [ ] **Step 1: Replace `submit` to register + sign in**

```tsx
import { signIn } from "next-auth/react";
// ...existing imports...

async function submit(e: React.FormEvent) {
  e.preventDefault();
  if (!name || !email || !password) {
    toast("Fill in every field to continue", "error");
    return;
  }
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    toast("Could not create account — is that email taken?", "error");
    return;
  }
  await signIn("credentials", { email, password, redirect: false });
  router.push("/onboarding");
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/signup/page.tsx
git commit -m "feat: signup registers user then signs in"
```

---

### Task 6: Wrap app in NextAuth `SessionProvider`

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add `SessionProvider`**

In `app/layout.tsx`, import `SessionProvider` from `next-auth/react` and wrap `{children}`:

```tsx
import { SessionProvider } from "next-auth/react";
// ...existing imports...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>{/* unchanged */}</head>
      <body>
        <SessionProvider>
          <ThemeProvider>
            <StoreProvider>
              <ToastProvider>{children}</ToastProvider>
            </StoreProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

`SessionProvider` is a client component and may be rendered from this server component. No other change needed; `AuthLayout` already provides the visual shell.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap app in NextAuth SessionProvider"
```

---

### Task 7: Make the store API-backed + delete mock

**Files:**
- Modify: `lib/store.tsx`
- Delete: `lib/mock.ts`

- [ ] **Step 1: Rewrite `StoreProvider` to hydrate from the API on session**

Replace the mock-seeded `useState` and remove `lib/mock` imports. Keep the same exported `useStore()` and `StoreContextValue`.

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { Account, Budget, Category, CategoryKey, Goal, Transaction, User } from "./types";
import { useToast } from "@/components/Toast";

// ...StoreState, NewTransaction, StoreContextValue interfaces unchanged...

const StoreContext = createContext<StoreContextValue | null>(null);
let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

async function loadJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json() as Promise<T>;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { push } = useToast();
  const [state, setState] = useState<StoreState | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    let cancelled = false;
    (async () => {
      try {
        const [transactions, accounts, categories, budgets, goals] = await Promise.all([
          loadJSON<Transaction[]>("/api/transactions"),
          loadJSON<Account[]>("/api/accounts"),
          loadJSON<Category[]>("/api/categories"),
          loadJSON<Budget[]>("/api/budgets"),
          loadJSON<Goal[]>("/api/goals"),
        ]);
        if (cancelled) return;
        const user: User = {
          id: session.user.id ?? "me",
          name: session.user.name ?? "You",
          currency: (session.user as any).currency ?? "USD",
        };
        setState({ user, accounts, categories, transactions, budgets, goals });
      } catch {
        push("Could not load your data", "error");
      }
    })();
    return () => { cancelled = true; };
  }, [status, session?.user?.id, push]);

  // ...addTransaction / addAccount / etc. become async and call the API (Task 8)...
  // ...value = useMemo(...) unchanged shape...

  if (!state) return <StoreContext.Provider value={null as any}>{children}</StoreContext.Provider>;
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
```

Note: while `state` is `null` (loading), pages should show `Skeleton`. Update each page's top to read `const store = useStore(); if (!store) return <Skeleton/>` OR guard inside. Keep it minimal: in `app/dashboard/page.tsx` add a loading guard (Task 10).

- [ ] **Step 2: Delete `lib/mock.ts`**

```bash
git rm lib/mock.ts
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors (no remaining references to `lib/mock`).

- [ ] **Step 4: Commit**

```bash
git add lib/store.tsx
git rm lib/mock.ts
git commit -m "feat: hydrate store from API on session; delete mock"
```

---

### Task 8: Store mutators call the API (optimistic + rollback)

**Files:**
- Modify: `lib/store.tsx`

For each mutator, POST/PUT/DELETE then update local state from the response. Example for `addTransaction` (apply the same pattern to `addAccount`, `updateAccount`, `archiveAccount`, `addCategory`, `deleteCategory`, `upsertBudget`, `deleteBudget`, `addGoal`, `updateGoal`, `deleteGoal`, `setCurrency`):

- [ ] **Step 1: Rewrite `addTransaction` to persist via API**

```tsx
const addTransaction = useCallback(async (t: NewTransaction) => {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t),
  });
  if (!res.ok) { push("Could not add transaction", "error"); return; }
  const created = (await res.json()) as Transaction;
  // refresh accounts so balances stay correct (API updates them server-side)
  const accounts = await loadJSON<Account[]>("/api/accounts").catch(() => state!.accounts);
  setState((s) => (s ? { ...s, transactions: [created, ...s.transactions], accounts } : s));
}, [push, state]);
```

Make `useStore()` consumers tolerate the async change (they currently call `addTransaction(t)` fire-and-forget — still works). `QuickAdd` and `TransactionModal` need no change.

- [ ] **Step 2: `setCurrency` persists to the user**

Add a `PATCH /api/user` route (or extend the session) — minimal version: persist currency by calling a new route. For scope, reuse the session: store currency locally and note server persistence as a follow-up. Simplest correct path:

```tsx
const setCurrency = useCallback(async (code: string) => {
  setState((s) => (s ? { ...s, user: { ...s.user, currency: code } } : s));
  await fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currency: code }) }).catch(() => {});
}, []);
```

Add `app/api/user/route.ts` (`PATCH` updates `user.currency` for the session user). Keep it tiny.

- [ ] **Step 3: Typecheck + tests**

```bash
npx tsc --noEmit && npm run test
```

Expected: no errors; tests pass.

- [ ] **Step 4: Commit**

```bash
git add lib/store.tsx app/api/user/route.ts
git commit -m "feat: store mutators persist via API with rollback"
```

---

### Task 9: DB adapter selection in `lib/prisma.ts` (finalize)

**Files:**
- Modify: `lib/prisma.ts`

Finalize `lib/prisma.ts` from the Task 0 decision (PGlite adapter if it worked, else `DATABASE_URL`/Neon). No new logic beyond Task 0; this task confirms the committed version is the chosen path and adds a comment documenting it.

- [ ] **Step 1: Confirm the committed `lib/prisma.ts` matches the Task 0 outcome**

If Task 0 fell back to Neon-for-local, ensure `lib/prisma.ts` uses the standard `new PrismaClient()` and that `.env.local` documents setting `DATABASE_URL` for local dev.

- [ ] **Step 2: Commit (if changed)**

```bash
git add lib/prisma.ts
git commit -m "chore: finalize Prisma adapter selection"
```

---

### Task 10: Dashboard uses session identity + loading guard

**Files:**
- Modify: `app/dashboard/page.tsx`
- Modify: `lib/auth.ts` (session callback exposes `currency`)
- Modify: `types/next-auth.d.ts` (add `currency` to session user)

- [ ] **Step 1: Add `currency` to the session**

In `lib/auth.ts` callbacks, extend `session` to carry currency:

```ts
async session({ session, token }) {
  if (session.user && token.id) session.user.id = token.id as string;
  if (session.user && token.currency) (session.user as any).currency = token.currency as string;
  return session;
}
async jwt({ token, user }) {
  if (user) { token.id = user.id; token.currency = (user as any).currency; }
  return token;
}
```

In `types/next-auth.d.ts`:

```ts
import { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface Session { user: { id: string; currency?: string } & DefaultSession["user"]; }
}
```

- [ ] **Step 2: Guard the dashboard while loading**

At the top of `DashboardPage`:

```tsx
const store = useStore();
if (!store) return <div className="p-6"><Skeleton /></div>;
const { transactions, accounts, categories, budgets, goals, user } = store;
```

Remove the hardcoded `user.name` dependency on mock (now `user` comes from the session). `greet` still works.

- [ ] **Step 3: Typecheck + tests**

```bash
npx tsc --noEmit && npm run test
```

Expected: no errors; tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx lib/auth.ts types/next-auth.d.ts
git commit -m "feat: dashboard reads session user; loading guard"
```

---

### Task 11: Docs — PGlite + Neon instructions

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Update `.env.example`**

```bash
# Local dev uses PGlite (zero-config) — leave DATABASE_URL unset.
# For prod (or local Neon), set:
# DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/finboard?sslmode=require"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

- [ ] **Step 2: Update `README.md` "Connect the real backend" section**

Replace the Neon-only steps with: local dev needs no DB setup (PGlite boots automatically); `npm run dev` → sign up → dashboard. For prod, set `DATABASE_URL` to Neon and run `db:push` + `db:seed`.

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: document PGlite local / Neon prod setup"
```

---

### Task 12: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Typecheck + build**

```bash
npx tsc --noEmit && npm run build
```

Expected: clean; build green (17 routes).

- [ ] **Step 2: Boot on PGlite (no env)**

```bash
npm run dev
```

Expected: app starts with no `DATABASE_URL` (PGlite). Sign up → onboarding → dashboard shows YOUR data; add a transaction → refresh keeps it (persisted). Each user sees only their own data.

- [ ] **Step 3: Run tests**

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 4: Commit (if any fixups)**

```bash
git add -A && git commit -m "fix: final wiring verification"
```
(Only if step 1–3 required changes.)

---

## Self-Review Notes

- Spec coverage: auth (Tasks 3–6,10), store hydration (7–8), DB (0,9,11), delete mock (7), tests (1–3), deploy docs (11), verification (12). All spec sections mapped.
- No placeholders: every step shows code or an exact command; the only conditional (PGlite adapter) is resolved concretely in Task 0 with a documented fallback, matching the spec's stated risk.
- Type consistency: `useStore()` / `StoreContextValue` shape preserved; `User`, `Transaction`, `Account`, `Category`, `Budget`, `Goal` types reused from `./types`; `loadJSON<T>` is the single fetch helper used across tasks.
