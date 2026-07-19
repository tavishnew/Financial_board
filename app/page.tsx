"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wallet, PieChart, Target, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/Button";
import { BentoGrid, BentoCard } from "@/components/Bento";
import { CountUp } from "@/components/CountUp";
import { CategoryPie } from "@/components/charts/lazy";
import { MiniTrend } from "@/components/charts/lazy";
import { useStore } from "@/lib/store";
import { netWorth, monthTotals, topCategory } from "@/lib/selectors";
import { formatMoney } from "@/lib/format";
import { CATEGORY_META } from "@/lib/categories";

const FEATURES = [
  { icon: Wallet, title: "Every account, one net worth", body: "Bank, card, cash and wallet — rolled into one honest number you can actually trust." },
  { icon: PieChart, title: "Spend by category, instantly", body: "A live pie that shows where the money goes, colored the same way everywhere." },
  { icon: Target, title: "Budgets that talk back", body: "Per-category limits with progress bars that turn red before you overshoot." },
  { icon: Zap, title: "Add in two taps", body: "Chunky category tiles and a floating add button make logging frictionless." },
  { icon: Sparkles, title: "Maximalist, still legible", body: "Bold bento grids and count-up numbers — without sacrificing a single decimal of clarity." },
  { icon: ShieldCheck, title: "Yours, synced", body: "Auth per user, data persisted, dark and light both look intentional." },
];

export default function LandingPage() {
  const { transactions, accounts, categories, budgets, user } = useStore();
  const nw = netWorth(accounts);
  const totals = monthTotals(transactions);
  const top = topCategory(transactions, categories);
  const topMeta = top ? CATEGORY_META[top.category.key] : null;

  return (
    <div className="grain relative overflow-hidden">
      {/* Decorative blobs (landing only) */}
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-accent/25 blur-[120px]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-muted md:flex">
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#preview" className="hover:text-ink">Preview</a>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-10 pt-10 text-center md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-5 inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-muted"
        >
          <Sparkles size={14} className="text-primary" /> Not another spreadsheet clone
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="display text-balance mx-auto max-w-4xl text-[clamp(2.75rem,8vw,5.5rem)] text-ink"
        >
          Your money, <span style={{ color: "var(--primary)" }}>in bold</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted"
        >
          MoneyTrail turns income, expenses, and budgets into a beautiful,
          editorial personal finance workspace that keeps your story simple and clear.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/signup">
            <Button size="lg">
              Start tracking free <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              See the dashboard
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Bento preview */}
      <section id="preview" className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        <BentoGrid>
          <BentoCard className="col-span-12 md:col-span-7" hover={false}>
            <span className="kicker">Net worth</span>
            <div className="display tabnum mt-2 text-[clamp(2.5rem,6vw,4rem)] text-ink">
              <CountUp value={nw} format={(n) => formatMoney(n, user.currency)} />
            </div>
            <div className="mt-1 text-sm text-[color:var(--c-income)] font-semibold">
              ▲ {Math.round((totals.net / Math.max(totals.income, 1)) * 100)}% saved this month
            </div>
            <div className="mt-4">
              <MiniTrend />
            </div>
          </BentoCard>
          <BentoCard className="col-span-12 md:col-span-5" hover={false}>
            <span className="kicker">This month</span>
            <div className="mt-2 space-y-3">
              <div>
                <div className="text-sm text-muted">Spent</div>
                <div className="display tabnum text-2xl text-ink">
                  {formatMoney(totals.expense, user.currency)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted">Earned</div>
                <div className="display tabnum text-2xl text-[color:var(--c-income)]">
                  {formatMoney(totals.income, user.currency)}
                </div>
              </div>
              {top && topMeta && (
                <div className="flex items-center gap-2 rounded-2xl bg-surface-2 p-3">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-xl"
                    style={{ background: `color-mix(in oklch, ${topMeta.hue} 18%, transparent)`, color: topMeta.hue }}
                  >
                    <topMeta.icon size={18} strokeWidth={2.4} />
                  </span>
                  <div className="text-sm">
                    <div className="text-muted">Top category</div>
                    <div className="font-bold text-ink">{topMeta.name}</div>
                  </div>
                </div>
              )}
            </div>
          </BentoCard>
          <BentoCard className="col-span-12" hover={false}>
            <div className="mb-2 flex items-center justify-between">
              <span className="kicker">Where it goes</span>
              <span className="text-sm text-muted">This month</span>
            </div>
            <CategoryPie />
          </BentoCard>
        </BentoGrid>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        <h2 className="display text-balance text-[clamp(1.8rem,4vw,2.75rem)] text-ink">
          Built for people who hate spreadsheets.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.06 }}
              className="card p-5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                <f.icon size={22} strokeWidth={2.3} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12">
        <div className="card relative overflow-hidden bg-primary p-10 text-center text-white">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
          <h2 className="display text-[clamp(1.8rem,5vw,3rem)]">Stop guessing. Start seeing.</h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Spin up your dashboard in a minute. It&apos;s free, it&apos;s bold, and it&apos;s yours.
          </p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Get started free <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row">
          <Logo />
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/login" className="hover:text-ink">Login</Link>
          </div>
          <span>© {new Date().getFullYear()} MoneyTrail</span>
        </div>
      </footer>
    </div>
  );
}


