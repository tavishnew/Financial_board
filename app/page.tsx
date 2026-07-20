"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wallet, PieChart, Target, Sparkles, ShieldCheck, Zap, Lock, Database, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import LandingHeader from "@/components/LandingHeader";
import { BentoGrid, BentoCard } from "@/components/Bento";
import { CountUp } from "@/components/CountUp";
import { CategoryPie } from "@/components/charts/lazy";
import { MiniTrend } from "@/components/charts/lazy";
import { useStore } from "@/lib/store";
import { FastMarketLottie } from "@/components/FastMarketLottie";
import { netWorth, monthTotals, topCategory } from "@/lib/selectors";
import { formatMoney } from "@/lib/format";
import { CATEGORY_META } from "@/lib/categories";
import { DEMO_TRANSACTIONS, DEMO_ACCOUNTS, DEMO_CATEGORIES } from "@/lib/demo";

const FEATURES = [
  { icon: Wallet, title: "Every account, one net worth", body: "Bank, card, cash and wallet — rolled into one honest number you can actually trust." },
  { icon: PieChart, title: "Spend by category, instantly", body: "A live pie that shows where the money goes, colored the same way everywhere." },
  { icon: Target, title: "Budgets that talk back", body: "Per-category limits with progress bars that turn red before you overshoot." },
  { icon: Zap, title: "Add in two taps", body: "Chunky category tiles and a floating add button make logging frictionless." },
  { icon: Sparkles, title: "Maximalist, still legible", body: "Bold bento grids and count-up numbers — without sacrificing a single decimal of clarity." },
  { icon: ShieldCheck, title: "Yours, synced", body: "Auth per user, data persisted, dark and light both look intentional." },
];

const PRIVACY = [
  { icon: Lock, title: "Hashed passwords", body: "Bcrypt hashing — we never see your raw password." },
  { icon: Database, title: "Local-first", body: "Your data lives in your own Postgres, not a third party's warehouse." },
  { icon: ShieldCheck, title: "Yours to export", body: "Take your data with you anytime. No lock-in, no tricks." },
  { icon: EyeOff, title: "No selling", body: "We don't monetize, share, or sell your financial activity." },
];

export default function LandingPage() {
  const { transactions, accounts, categories, budgets, user } = useStore();
  const hasData = transactions.length > 0;
  const dTxns = hasData ? transactions : DEMO_TRANSACTIONS;
  const dAccounts = accounts.length ? accounts : DEMO_ACCOUNTS;
  const dCategories = categories.length ? categories : DEMO_CATEGORIES;
  const nw = netWorth(dAccounts);
  const totals = monthTotals(dTxns);
  const top = topCategory(dTxns, dCategories);
  const topMeta = top ? CATEGORY_META[top.category.key] : null;

  return (
    <div className="grain relative overflow-hidden">
      {/* Nav — hidden by default, reveals on hover near the top edge */}
      <LandingHeader />

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 pb-10 pt-20 text-center md:grid-cols-2 md:gap-8 md:pt-32 md:text-left">
      <div>
        <motion.div
          initial={{ opacity: 0, transform: "translateY(16px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-muted"
          >
            <Zap size={14} className="text-accent" /> Live market data, built in
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, transform: "translateY(20px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="display text-balance text-[clamp(2.5rem,7vw,5rem)] text-ink"
          >
            Your money, <span style={{ color: "var(--primary)" }}>finally legible</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, transform: "translateY(20px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted md:mx-0"
          >
            MoneyTrail turns income, expenses, and budgets into a beautiful,
            editorial personal finance workspace that keeps your story simple and clear.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, transform: "translateY(20px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start"
          >
            <Link href="/signup">
              <Button size="xl">
                Start tracking free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="xl" variant="outline">
                See the dashboard
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Fast Market Access animation, themed to the indigo/gold system */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: [0, -12, 0], scale: 1 }}
        transition={{
          opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative"
      >
          {/* Pulsing brand glow behind the Lottie */}
          <div aria-hidden className="hero-glow pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl" />
          {/* Drifting accent glow for warmth */}
          <div aria-hidden className="animate-drift pointer-events-none absolute right-4 top-4 h-36 w-36 rounded-full bg-accent/25 blur-3xl" />
          {/* Rotating indigo/gold brand ring tracing the panel edge */}
          <div aria-hidden className="hero-ring pointer-events-none absolute inset-0 rounded-[2.25rem]" />
          {/* Static crisp inner ring + soft primary glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[2.25rem] border border-primary/20"
            style={{ boxShadow: "0 0 70px -12px color-mix(in oklch, var(--primary) 45%, transparent)" }}
          />
          <div className="relative mx-auto aspect-square w-full max-w-[400px] mt-10">
            <FastMarketLottie className="h-full w-full" />
          </div>
        </motion.div>
      </section>

      {/* Bento preview */}
      <section id="preview" className="relative z-10 mx-auto max-w-6xl px-5 mt-20 pt-24 pb-10">
        <BentoGrid>
          <BentoCard className="col-span-12 md:col-span-7" hover={false}>
            <span className="kicker">Net worth</span>
            <div className="display tabnum mt-2 text-[clamp(2.5rem,6vw,4rem)] text-ink">
              <CountUp value={nw} format={(n) => formatMoney(n, user.currency)} />
            </div>
            <div className="mt-1 text-sm text-primary font-semibold">
              ▲ {Math.round((totals.net / Math.max(totals.income, 1)) * 100)}% saved this month
            </div>
            <div className="mt-4">
              <MiniTrend demo />
            </div>
          </BentoCard>
          <BentoCard className="col-span-12 md:col-span-5" hover={false}>
            <span className="kicker">This month</span>
            <div className="mt-2 space-y-3">
              <div>
                <div className="text-sm text-muted">Spent</div>
                <div className="display tabnum text-2xl text-ink">
                  <CountUp value={totals.expense} format={(n) => formatMoney(n, user.currency)} />
                </div>
              </div>
              <div>
                <div className="text-sm text-muted">Earned</div>
                <div className="display tabnum text-2xl text-primary">
                  <CountUp value={totals.income} format={(n) => formatMoney(n, user.currency)} />
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
            <CategoryPie demo />
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
              initial={{ opacity: 0, transform: "translateY(16px)" }}
              whileInView={{ opacity: 1, transform: "translateY(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.06 }}
              className={"card p-5 group" + (i === 0 ? " lg:col-span-2 bg-primary/5 border-primary/15" : "")}
            >
              <span className={"grid place-items-center rounded-2xl bg-primary/15 text-primary transition-transform duration-300 ease-out-quint group-hover:scale-110 group-hover:-rotate-3 " + (i === 0 ? "h-14 w-14" : "h-11 w-11")}>
                <f.icon size={i === 0 ? 26 : 22} strokeWidth={2.3} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink transition-colors group-hover:text-primary">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        <div className="card relative overflow-hidden p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="kicker">Privacy</span>
              <h2 className="display mt-2 text-[clamp(1.8rem,4vw,2.75rem)] text-ink">
                Your money stays yours.
              </h2>
              <p className="mt-3 max-w-xl text-muted">
                MoneyTrail is built local-first. We never sell your data, and your
                credentials are hashed before they ever touch storage.
              </p>
            </div>
            <Link href="/privacy" className="shrink-0">
              <Button variant="outline" size="sm">Read the full policy</Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRIVACY.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, transform: "translateY(16px)" }}
                whileInView={{ opacity: 1, transform: "translateY(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (i % 4) * 0.06 }}
                className="group rounded-2xl border border-line bg-surface-2 p-5 transition-colors hover:border-primary/30"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary transition-transform duration-300 ease-out-quint group-hover:scale-110">
                  <p.icon size={20} strokeWidth={2.3} />
                </span>
                <h3 className="mt-3 text-sm font-bold text-ink">{p.title}</h3>
                <p className="mt-1 text-xs text-muted">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12">
          <div className="card relative overflow-hidden bg-primary dark:bg-primary-press p-10 text-center text-black">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
          <h2 className="display text-[clamp(1.8rem,5vw,3rem)]">Stop guessing. Start seeing.</h2>
          <p className="mx-auto mt-3 max-w-md text-black">
            Spin up your dashboard in a minute. It&apos;s free, it&apos;s bold, and it&apos;s yours.
          </p>
          <Link href="/signup" className="mt-6 block">
            <Button size="lg" className="w-full">
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


