# Design

## Theme

Dark base by default (neon accents pop on near-black), with a full light mode where shadows and borders do the work. Maximalist bento grid: asymmetric cards (1x1, 2x1, 2x2) in a consistent 16px-gap, 20px-radius CSS grid. One or two hero cards carry the big numbers.

Color strategy: **Committed** — a saturated coral primary plus a neon accent carry identity; category hues form a fixed 8-role palette used consistently across charts, tags, and budget bars.

### Tokens (OKLCH)

Dark (default):
- `--bg` oklch(0.15 0.01 50) — near-black, barely warm
- `--surface` oklch(0.20 0.012 50)
- `--surface-2` oklch(0.25 0.014 50)
- `--line` oklch(0.30 0.01 50) — hairline borders
- `--ink` oklch(0.97 0 0) — body + display text (white on dark)
- `--muted` oklch(0.72 0.012 50) — secondary text
- `--primary` oklch(0.70 0.17 45) — warm coral / burnt amber
- `--primary-press` oklch(0.64 0.18 45)
- `--accent` oklch(0.75 0.15 200) — electric cyan (distinct hue + lightness from primary)

Light:
- `--bg` oklch(0.98 0.004 60) — off-white
- `--surface` oklch(1 0 0) — white cards
- `--surface-2` oklch(0.96 0.005 60)
- `--line` oklch(0.88 0.006 60)
- `--ink` oklch(0.22 0.012 50) — near-black text
- `--muted` oklch(0.45 0.012 55)
- `--primary` oklch(0.62 0.18 45)
- `--accent` oklch(0.55 0.16 215)

Category hues (fixed, both modes):
- income green `oklch(0.78 0.17 145)`
- food amber `oklch(0.72 0.16 60)`
- transport blue `oklch(0.65 0.16 250)`
- shopping violet `oklch(0.62 0.20 300)`
- bills red `oklch(0.62 0.20 20)`
- fun pink `oklch(0.68 0.18 350)`
- health cyan `oklch(0.72 0.14 195)`
- savings teal `oklch(0.75 0.15 160)`

## Typography

- Display / numbers: **Bricolage Grotesque** (expressive, bold) with `font-variant-numeric: tabular-nums`.
- Body / UI: **Hanken Grotesque** (neutral grotesk).
- Scale: hero numbers clamp(2.75rem, 6vw, 4rem) [44–64px]; section headings clamp(1.5rem, 3vw, 2.25rem); body 0.9375–1rem (15–16px); labels 0.8125rem (13px) with tracking.
- `text-wrap: balance` on h1–h3; `text-wrap: pretty` on long prose.

## Layout

- Bento grid: `display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px;` with cards spanning 1–8 columns and 1–2 rows. Responsive collapse via `auto-fit minmax` and explicit breakpoints.
- Semantic z-index scale: dropdown 40 → sticky 50 → modal-backdrop 100 → modal 110 → toast 200 → tooltip 210.
- Floating quick-add action on dashboard.

## Motion

- Bento cards: hover lift + shadow deepen (transform + shadow, ease-out-quint).
- Numbers: count-up on load.
- Chart entrance: staggered (pie slices, line draw, bar grow).
- All motion wrapped in `prefers-reduced-motion: reduce` → crossfade/instant.

## Components

- `BentoCard` — rounded surface, layered color-tinted shadow, optional hero size, hover lift.
- `StatCard` — label (muted, tracked) + big tabular number + delta chip.
- `ProgressBar` — category-hued fill, ≥4.5:1 track.
- `CategoryPill` — hue dot + icon + label; color never the only signal.
- `Button` — primary (coral, white text), ghost, danger; chunky 2px radius-12.
- `Toast` / `ConfirmDialog` — delete confirmations and alerts.
- `EmptyState` — per-list zero-data illustration + CTA.
- `Skeleton` — shimmer blocks matching bento shapes.

## Anti-patterns (enforced)

- No side-stripe colored borders on cards.
- No gradient text.
- No glassmorphism by default.
- No hero-metric template, no identical card grids, no eyebrow-on-every-section, no 01/02/03 scaffolding.
- No text overflowing its container — headings tested at every breakpoint.
- Contrast on money numbers is sacred.
