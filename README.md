# MoneyTrail — maximalist personal finance tracker

A Next.js 14 (App Router) + TypeScript + Tailwind finance tracker with a bold bento-grid
dashboard. Built from the product/design specs in this repo (`PRODUCT.md`, `DESIGN.md`).

## Stack
- Frontend: Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · Recharts
- Backend: Next API routes + NextAuth (Auth.js) · Prisma ORM
- Database: PostgreSQL — **local dev uses PGlite** (embedded, zero-config);
  production uses **Neon** (or any Postgres) via `DATABASE_URL`
- Passwords: bcryptjs · validation: zod

## Quick start (local, zero-config)
No external database required. Local dev uses an embedded PGlite file (`.MoneyTrail-data`).
```bash
npm install
npm run dev        # runs setup-db, then serves on http://localhost:3100
```
`npm run dev` automatically creates the schema (if missing) and seeds a demo account the
first time the database is empty:
- Email: `tavis@finance.app`
- Password: `Password1!`

Open http://localhost:3100, log in, and the UI hydrates from the real `/api/*` routes.

To wipe and reseed: delete `.MoneyTrail-data` (gitignored) and restart `npm run dev`,
or run `npm run db:setup`.

## Production (Neon / any Postgres)
1. Set `DATABASE_URL` to your Postgres connection string in `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/MoneyTrail?sslmode=require"
   ```
   When `DATABASE_URL` starts with `postgresql://` (or `postgres://`), MoneyTrail uses a
   standard Prisma client against that server. Any other value (including empty/unset) is
   treated as a local PGlite data-directory path (default `./.MoneyTrail-data`).
2. Set `NEXTAUTH_SECRET` (`openssl rand -base64 32`) and `NEXTAUTH_URL`.
3. Generate the Prisma client and create the tables:
   ```bash
   npm run db:generate
   npx prisma db push        # creates tables on your Postgres
   ```
4. Build and start:
   ```bash
   npm run build && npm run start
   ```

## Environment variables
See `.env.example`. Key knobs:
- `DATABASE_URL` — Postgres URL for prod, or omit/set a path for local PGlite.
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` — required by NextAuth.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional; enables Google sign-in when set.

## API
All `/api/*` routes are session-protected (see `middleware.ts`):
- `GET/POST /api/transactions`, `DELETE /api/transactions/[id]`
- `GET/POST /api/accounts`, `PATCH/DELETE /api/accounts/[id]`
- `GET/POST /api/categories`, `DELETE /api/categories/[id]`
- `POST /api/budgets` (upsert by category), `DELETE /api/budgets/[id]`
- `GET/POST /api/goals`, `PATCH/DELETE /api/goals/[id]`
- `PATCH /api/user` (update currency)
- `GET /api/dashboard` (aggregated stats)
- Auth: `/api/auth/*` (NextAuth credentials + optional Google)

## Design
See `PRODUCT.md` (strategy) and `DESIGN.md` (hex tokens, type scale, motion). **Light by
default** with a full dark mode; the app-shell sidebar is always dark espresso (`#1A1611`). Identity is an
editorial forest-green primary (`#0E7C5B`) with a brass accent (`#C2883B`), set on warm cream paper. Category hues are fixed
and reused across charts, tags, and budget bars.

## Scripts
`npm run dev` · `npm run build` · `npm run start` · `npm run typecheck` ·
`npm run test` · `npm run db:generate` · `npm run db:setup` (create schema + seed)

