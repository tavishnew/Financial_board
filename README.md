# Finboard — maximalist personal finance tracker

A Next.js 14 (App Router) + TypeScript + Tailwind finance tracker with a bold bento-grid
dashboard. Built from the spec MDs in this repo (`00-overview.md` … `06-roadmap-mvp.md`).

## Stack
- Frontend: Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · Recharts
- Backend: Next API routes + NextAuth (Auth.js) · Prisma ORM · PostgreSQL (Neon)
- Passwords: bcryptjs · validation: zod

## Run (frontend demo, no DB required)
The UI runs today on a seeded in-memory store (`lib/store.tsx` + `lib/mock.ts`), so you can
see the whole product immediately:
```bash
npm install
npm run dev        # http://localhost:3000
```

## Connect the real backend (Prisma + Neon + Auth.js)
1. Copy env and fill in values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` — your Neon Postgres connection string (`?sslmode=require`).
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`.
2. Generate the client and create tables:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed     # creates demo@finboard.app / password123
   ```
3. Start the app and log in with the seeded demo account.

### Switching the UI from mock data to the API
To go live against the database, hydrate `lib/store.tsx` from the session-protected
`/api/*` routes on mount (it currently seeds from `lib/mock.ts`). The API routes are
ready and already session-protected:
- `GET/POST  /api/transactions`, `DELETE /api/transactions/[id]`
- `GET/POST  /api/accounts`
- `GET/POST  /api/categories`
- `POST      /api/budgets` (upsert by category)
- `GET/POST  /api/goals`, `PATCH/DELETE /api/goals/[id]`
- `GET       /api/dashboard` (aggregated stats)
- Auth: `/api/auth/*` (NextAuth credentials + optional Google)

Route protection lives in `middleware.ts` (redirects unauthenticated users to `/login`).

## Design
See `PRODUCT.md` (strategy) and `DESIGN.md` (OKLCH tokens, type scale, motion). Dark by default
with full light mode. Category hues are fixed and reused across charts, tags, and budget bars.

## Scripts
`npm run dev` · `npm run build` · `npm run start` · `npm run typecheck` ·
`npm run db:generate` · `npm run db:push` · `npm run db:seed`
