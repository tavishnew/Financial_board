# Design — MoneyTrail

> Source of truth for the MoneyTrail visual system. Generated from the shipped code
> (`app/globals.css`, `tailwind.config.ts`, `components/AppShell.tsx`, `components/Logo.tsx`).
> If a value here disagrees with `globals.css`, `globals.css` wins — update this file.

## North star (the "memorable thing")

**"Your money, finally legible."** — A maximalist bento dashboard that stays ruthlessly
legible where the numbers matter. Three words from `PRODUCT.md`: **bold, dense, legible**.
Every design decision below should serve that one memory. If a choice makes the
balances harder to read, it loses — even if it looks cooler.

## Theme

**Light by default**, with a full dark mode. The identity is an **editorial** system: a
deep **forest green** primary (`#0E7C5B`) with a warm **brass** accent (`#C2883B`), set on a
warm **cream** paper (`#FBF7F0`). It reads like a well-set financial broadsheet, not a
generic blue fintech app.

The app shell's **sidebar is always dark espresso** (`#1A1611`), independent of the page
theme. It is the constant anchor while the content area flips between light and dark.

Maximalist bento grid: asymmetric cards (1×1, 2×1, 2×2) in a consistent 16px-gap,
20px-radius CSS grid. One or two hero cards carry the big numbers.

Color strategy: **Committed** — a saturated green primary plus a brass accent carry
identity; category hues form a fixed 8-role palette reused consistently across charts,
tags, and budget bars.

### Tokens (hex — authoritative)

Light (default):
- `--bg` `#FBF7F0` — warm cream paper
- `--surface` `#FFFFFF` — white cards
- `--surface-2` `#F4EEDF` — inset fields, hover wells
- `--line` `#E8DFCE` — hairline borders
- `--ink` `#211C16` — body + display text (near-black espresso)
- `--muted` `#6E6457` — secondary text
- `--primary` `#0E7C5B` — forest green
- `--primary-press` `#0B6349`
- `--accent` `#C2883B` — brass
- `--on-primary` `#FFFFFF`
- `--shadow-card` `0 4px 20px -2px rgba(33,28,22,.06), 0 2px 6px -1px rgba(33,28,22,.04)`
- `--shadow-card-hover` `0 10px 30px -4px rgba(33,28,22,.10), 0 4px 12px -2px rgba(33,28,22,.05)`
- `--shadow-glow` `0 0 0 1px rgba(14,124,91,.18), 0 4px 12px rgba(14,124,91,.14)`

Dark (`.dark`):
- `--bg` `#14110D` — near-black espresso
- `--surface` `#1F1B16`
- `--surface-2` `#2C2620`
- `--line` `#332D26`
- `--ink` `#F7F2E9` — warm bone
- `--muted` `#A89C8C`
- `--primary` `#0E7C5B` — forest green (unchanged)
- `--primary-press` `#0B6349`
- `--accent` `#C2883B` — brass (unchanged)
- `--on-primary` `#FFFFFF`
- `--shadow-card` `0 4px 20px -2px rgba(0,0,0,.35)`
- `--shadow-card-hover` `0 10px 30px -4px rgba(0,0,0,.45)`
- `--shadow-glow` `0 0 0 1px rgba(14,124,91,.28), 0 4px 12px rgba(14,124,91,.18)`

Sidebar (always on, theme-independent):
- bg `#1A1611`, border `#2C2620`
- text bone `#F7F2E9`, muted `#A89C8C`
- active item bg `#0E7C5B` (white text), hover item `white/5`
- avatar chip bg `#0E7C5B` with `shadow-[#0E7C5B]/25`

Category hues (fixed, both modes — OKLCH so they stay vivid in either theme):
- income green `oklch(0.78 0.17 145)`
- food amber `oklch(0.72 0.16 60)`
- transport blue `oklch(0.65 0.16 250)`
- shopping violet `oklch(0.62 0.20 300)`
- bills red `oklch(0.62 0.20 20)`
- fun pink `oklch(0.68 0.18 350)`
- health cyan `oklch(0.72 0.14 195)`
- savings teal `oklch(0.75 0.15 160)`

## Typography

- Display / numbers: **Bricolage Grotesque** (expressive, weights 400/700/800) with
  `font-variant-numeric: tabular-nums`; used for hero balances and big headings.
- Body / UI: **Hanken Grotesque** (neutral grotesk, weights 400–800).
- Loaded via Google Fonts `<link>` in `app/layout.tsx` (not `next/font`):
  `Bricolage Grotesque` opsz 12..96 + `Hanken Grotesque`.
- Scale: hero numbers `clamp(2.75rem, 6vw, 4rem)` [44–64px]; section headings
  `clamp(1.5rem, 3vw, 2.25rem)`; body `0.9375–1rem` (15–16px); labels `0.8125rem` (13px)
  with tracking.
- `text-wrap: balance` on `h1–h3`; `text-wrap: pretty` on long prose.
- `--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1)` drives all motion.

## Layout

- Bento grid: `.bento-grid` → `display:grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap:16px;`
  Collapses to 6 cols ≤900px and 2 cols ≤560px. Cards span 1–8 columns and 1–2 rows.
- App shell: fixed **dark espresso sidebar** (260px, `lg:grid-cols-[260px_1fr]`) + sticky topbar
  (`h-16`, `z-40`, `backdrop-blur`, `bg-surface/80`) + content `<main>` capped at
  `max-w-5xl`. Mobile gets a slide-in sidebar (`z-100`) and a bottom tab bar
  (first 5 nav items, `lg:hidden`).
- Semantic z-index: sticky/topbar `40` → mobile sidebar `100` → alerts popover `50` →
  modal-backdrop `100` → modal `110` → toast `200` → tooltip `210`.
- Floating quick-add action (`QuickAdd`) in the topbar.

## Motion

- Bento cards: hover lift + shadow deepen (`transform: translateY(-2px)` + `--shadow-card-hover`,
  ease-out-quint). Defined in `.card:hover`.
- Numbers: count-up on load (`CountUp` + `count-fade` keyframe).
- Chart entrance: staggered (pie slices, line draw, bar grow) via lazy-loaded Recharts.
- All motion wrapped in `prefers-reduced-motion: reduce` → near-instant crossfade.

## Components

`components/`:
- `AppShell` — dark-espresso sidebar + topbar + mobile bottom nav; nav, search, alerts, theme toggle, quick-add.
- `AuthLayout` — centered auth frame (login / signup / onboarding).
- `Logo` — ring + trailing stroke mark in `--primary` + "MoneyTrail" wordmark (`.display`).
- `Bento` — bento-grid container + `BentoCard` span helpers.
- `Button` — primary (green, white text) / ghost / danger; `radius-button` 12px.
- `StatCard` — label (muted, tracked) + big tabular number + delta chip.
- `ProgressBar` — category-hued fill, ≥4.5:1 track.
- `CategoryBadge` — hue dot + label; color never the only signal.
- `CountUp` — animated tabular number.
- `EmptyState` — per-list zero-data illustration + CTA.
- `Skeleton` — shimmer blocks matching bento shapes.
- `Toast` / `ConfirmDialog` — delete confirmations and alerts.
- `TransactionModal` / `TransactionRow` — add/edit + list rows.
- `QuickAdd` — topbar quick transaction entry.
- `ThemeProvider` / `ThemeToggle` — class-based dark mode + no-flash init script.
- `Providers` — NextAuth `SessionProvider` wrapper.

`components/charts/` (all lazy-loaded via `charts/lazy.tsx`):
- `CategoryPie` — spend-by-category donut.
- `TrendArea` — income/expense trend area.
- `CompareBar` — budget-vs-actual bars.
- `MiniTrend` — inline sparkline for stat cards.
- `ChartTooltip` — shared chart tooltip.

## Utility classes (from `globals.css`)

- `.bento-grid` — 12-col responsive grid, 16px gap.
- `.card` — surface + 1px line + 20px radius + soft shadow; `.card:hover` lift.
- `.display` — Bricolage Grotesque, weight 800, tight tracking, line-height .98.
- `.kicker` — 12px uppercase, `.14em` tracking, muted.
- `.tabnum` — `tabular-nums` for money alignment.
- `.input` — 2.75rem field, 1rem radius, surface-2 fill, green focus ring.
- `.prose-fin` — legal/terms prose (headings + primary links).
- `.grain` — subtle SVG noise overlay (used sparingly, `mix-blend-mode: overlay`).
- `.text-balance` / `.text-pretty` — wrap helpers.

## Anti-patterns (enforced)

- No side-stripe colored borders on cards.
- No gradient text.
- No glassmorphism by default (only the `backdrop-blur` topbar, which stays legible).
- No hero-metric template, no identical card grids, no eyebrow-on-every-section, no 01/02/03 scaffolding.
- No text overflowing its container — headings tested at every breakpoint.
- Contrast on money numbers is sacred — no aesthetic choice may reduce contrast on a real balance.
- Category color is never the only signal — pair with icon + label.
