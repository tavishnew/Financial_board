# Finboard — Wire Real Backend (Design)

**Date:** 2026-07-19
**Status:** Approved (design)
**Source:** brainstorming session; `PRODUCT.md` MVP ("working auth with per-user data", "live deployable URL")

## 1. Context
Finboard today is two disconnected halves:
- A polished front-end (landing, login/signup, 9 app screens) built on a **client-side in-memory mock store** (`lib/store.tsx` ← `lib/mock.ts`). Zero `fetch()` calls exist in `app/` or `components/`.
- A **complete, session-protected backend**: 9 API routes (`/api/*`), Prisma schema, NextAuth config (`lib/auth.ts`), and `middleware.ts` that gates every app route.

Consequences (verified):
- `signIn` / `useSession` / `SessionProvider` are never used client-side, so login/signup never establish a session.
- `middleware.ts` redirects all app routes to `/login` when unauthenticated → the dashboard and every app screen are **currently unreachable**.
- All data is `useState` in the store → a refresh wipes everything. No persistence, no per-user data.

`PRODUCT.md` MVP is unmet. This design closes the gap: wire auth + hydrate the store from the API + persist via Prisma, with zero-config local dev (PGlite) and Neon for prod.

## 2. Goal
Turn the prototype into a real, persistent, per-user finance tracker:
1. Real authentication (credentials) that establishes a session and makes app screens reachable.
2. The store is hydrated from `/api/*` and writes back through it (no more mock data).
3. Data persists in Postgres (PGlite locally, Neon in prod); refresh keeps your data.
4. The logged-in user's identity drives the UI (replaces hardcoded "Tavis").

## 3. Non-goals (YAGNI)
- Google OAuth — deferred (README marks it optional; credentials-only satisfies MVP).
- React Query rewrite — rejected (approach #2); we keep the Context store.
- Bank-file / CSV import — out of scope.
- Multi-currency beyond the existing single `user.currency` setting — out of scope.
- Replacing the backend with localStorage — rejected (approach B); we want real persistence.

## 4. Approach
**API-backed store, mock removed (approach #1).** The `useStore()` Context interface is preserved. On session establishment it fetches from `/api/*`; mutators POST/PUT/DELETE then update local state optimistically. `lib/mock.ts` is deleted.

## 5. Architecture & data flow
### 5.1 Auth
- `app/login/page.tsx`: `submit` → `signIn("credentials", { email, password, redirect: false })`; on success `router.push("/dashboard")`.
- `app/signup/page.tsx`: `submit` → `POST /api/auth/register` (creates user + bcrypt hash) → `signIn` → `/onboarding`.
- New `app/api/auth/register/route.ts`: zod-validated `{ name, email, password }`; rejects duplicate email (409); returns 201.
- `components/AuthLayout.tsx` (or `app/layout.tsx`) wraps the app in NextAuth `SessionProvider`. Dashboard uses `useSession()` to get the user; `lib/store.tsx` seeds `user` from the session identity, not `mock.currentUser`.
- `lib/auth.ts` already implements the credentials `authorize` against Prisma — no change needed there.

### 5.2 Store (lib/store.tsx)
- Add `useEffect` keyed on `session?.user?.id`: fetch `/api/dashboard` (aggregates) + `/api/transactions`, `/api/accounts`, `/api/categories`, `/api/budgets`, `/api/goals`; populate state.
- Mutators (`addTransaction`, `addAccount`, `upsertBudget`, `addGoal`, …) call the corresponding API route, then update local state from the response (optimistic where safe; rollback + toast on failure).
- Keep the same exported `useStore()` hook and `StoreContextValue` shape so pages don't change.

### 5.3 Database
- Provider stays `postgresql` in `prisma/schema.prisma`.
- **Local dev:** PGlite (embedded, zero-config) via a Prisma driver adapter. `DATABASE_URL` not required locally; `lib/prisma.ts` selects the PGlite adapter when `NODE_ENV !== "production"` and no `DATABASE_URL` is set.
- **Prod:** `DATABASE_URL` points at Neon; standard Prisma client.
- **Risk (validate first):** Prisma has no official PGlite adapter. Spike a community PGlite↔Prisma driver adapter during implementation step 0. Fallbacks, in order: (a) Neon-for-local (needs network), (b) switch local provider to `sqlite` for dev only. Document the chosen path.

### 5.4 Deletions
- Delete `lib/mock.ts`. Remove the `currentUser` / `seed*` imports from `lib/store.tsx`.

## 6. Files touched (summary)
- New: `app/api/auth/register/route.ts`
- Modify: `lib/store.tsx` (hydrate + mutators + session user), `app/login/page.tsx`, `app/signup/page.tsx`, `components/AuthLayout.tsx` (or `app/layout.tsx`) for `SessionProvider`, `app/dashboard/page.tsx` (session user), `lib/prisma.ts` (PGlite adapter selection), `.env.example` / README (PGlite + Neon instructions).
- Delete: `lib/mock.ts`
- Verify (no change expected, just confirm live data): `app/transactions`, `accounts`, `budgets`, `goals`, `analytics`, `recurring`, `settings`, `onboarding` pages.
- Tests (new): `vitest` config + `lib/selectors.test.ts` + one API-route test (e.g., transactions GET/POST with a test DB or mocked prisma).

## 7. Error & loading states (reuse existing components)
- Loading: show `Skeleton` (already built) while hydrating.
- Empty: `EmptyState` for zero-data lists (already built).
- Failure: `Toast` on API/optimistic failure; `useStore` reverts optimistic update.
- Auth errors: `signIn` failure → toast "Invalid email or password".

## 8. Testing
- Add Vitest + a minimal runner.
- Unit: `lib/selectors.ts` (`netWorth`, `monthTotals`, `budgetProgress`, `topCategory`) with seeded inputs.
- Integration (optional, time-permitting): `app/api/transactions/route.ts` GET/POST against a PGlite/SQLite test DB or mocked `prisma`.

## 9. Deployment
- Build: `npm run build` (already green).
- DB: `npm run db:generate`; `npm run db:push` + `npm run db:seed` against Neon.
- Env: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` set in host.

## 10. Verification (definition of done)
- `tsc --noEmit` clean; `next build` green.
- `npm run dev` with no env → app boots on PGlite, no external setup.
- Sign up → lands in onboarding; log in → reaches dashboard.
- Add a transaction → appears in dashboard/transactions; **refresh keeps it** (persisted in DB).
- Each user sees only their own data (session-scoped queries already enforce this in the API).
- Vitest suite passes.

## 11. Risks
- PGlite↔Prisma driver adapter compatibility (spike first; fallbacks documented in §5.3).
- Hydration timing: store must wait for session before fetching; guard against fetching with `userId: undefined`.
- Optimistic updates must roll back correctly on API error.
