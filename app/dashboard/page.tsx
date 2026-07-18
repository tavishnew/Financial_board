"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingDown, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BentoGrid, BentoCard } from "@/components/Bento";
import { CountUp } from "@/components/CountUp";
import { ProgressBar } from "@/components/ProgressBar";
import { CategoryPie } from "@/components/charts/CategoryPie";
import { MiniTrend } from "@/components/charts/MiniTrend";
import { TransactionRow } from "@/components/TransactionRow";
import { QuickAdd } from "@/components/QuickAdd";
import { useStore } from "@/lib/store";
import {
  netWorth,
  monthTotals,
  topCategory,
  recentTransactions,
  budgetProgress,
} from "@/lib/selectors";
import { formatMoney, pct } from "@/lib/format";
import { CATEGORY_META } from "@/lib/categories";

export default function DashboardPage() {
  const { transactions, accounts, categories, budgets, goals, user } = useStore();
  const nw = netWorth(accounts);
  const totals = monthTotals(transactions);
  const top = topCategory(transactions, categories);
  const topMeta = top ? CATEGORY_META[top.category.key] : null;
  const recent = recentTransactions(transactions, 6);
  const budgetsProgress = budgetProgress(transactions, budgets, categories).slice(0, 4);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kicker">{greet}, {user.name}</div>
          <h1 className="display text-3xl text-ink">Dashboard</h1>
        </div>
        <QuickAdd />
      </div>

      <BentoGrid>
        {/* Hero net worth */}
        <BentoCard className="col-span-12 md:col-span-7">
          <div className="flex items-start justify-between">
            <span className="kicker">Net worth</span>
            <span className="rounded-pill bg-[color:var(--c-income)]/15 px-2.5 py-1 text-xs font-bold text-[color:var(--c-income)]">
              ▲ {totals.income ? Math.round((totals.net / totals.income) * 100) : 0}% this month
            </span>
          </div>
          <div className="display tabnum mt-2 text-[clamp(2.5rem,6vw,4rem)] text-ink">
            <CountUp value={nw} format={(n) => formatMoney(n, user.currency)} />
          </div>
          <div className="mt-1 text-sm text-muted">
            Across {accounts.filter((a) => !a.archived).length} active accounts
          </div>
          <div className="mt-4">
            <MiniTrend />
          </div>
        </BentoCard>

        {/* This month */}
        <BentoCard className="col-span-12 md:col-span-5">
          <span className="kicker">This month</span>
          <div className="mt-3 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <TrendingDown size={14} /> Spent
              </div>
              <div className="display tabnum text-2xl text-ink">
                {formatMoney(totals.expense, user.currency)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <ArrowUpRight size={14} className="text-[color:var(--c-income)]" /> Earned
              </div>
              <div className="display tabnum text-2xl text-[color:var(--c-income)]">
                {formatMoney(totals.income, user.currency)}
              </div>
            </div>
            {top && topMeta && (
              <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl"
                  style={{ background: `color-mix(in oklch, ${topMeta.hue} 18%, transparent)`, color: topMeta.hue }}
                >
                  <topMeta.icon size={20} strokeWidth={2.4} />
                </span>
                <div className="text-sm">
                  <div className="text-muted">Top category</div>
                  <div className="font-bold text-ink">
                    {topMeta.name} · {formatMoney(top.amount, user.currency)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Budgets */}
        <BentoCard className="col-span-12 md:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <span className="kicker">Budget progress</span>
            <Link href="/budgets" className="text-sm font-semibold text-primary hover:underline">
              Manage
            </Link>
          </div>
          <div className="space-y-4">
            {budgetsProgress.length === 0 && (
              <p className="text-sm text-muted">No budgets yet — set some on the Budgets page.</p>
            )}
            {budgetsProgress.map((b) => {
              const meta = b.category ? CATEGORY_META[b.category.key] : null;
              return (
                <div key={b.budget.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{b.category?.name}</span>
                    <span className="tabnum text-muted">
                      {formatMoney(b.spent, user.currency)} / {formatMoney(b.limit, user.currency)}
                    </span>
                  </div>
                  <ProgressBar value={b.pct} hue={meta?.hue ?? "var(--primary)"} />
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Recent transactions */}
        <BentoCard className="col-span-12 md:col-span-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="kicker">Recent</span>
            <Link href="/transactions" className="text-sm font-semibold text-primary hover:underline">
              All
            </Link>
          </div>
          <div className="divide-y divide-line">
            {recent.map((t) => (
              <TransactionRow key={t.id} txn={t} />
            ))}
          </div>
        </BentoCard>

        {/* Category breakdown */}
        <BentoCard className="col-span-12 md:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <span className="kicker">Where it goes</span>
            <span className="text-sm text-muted">This month</span>
          </div>
          <CategoryPie />
        </BentoCard>

        {/* Goals mini */}
        <BentoCard className="col-span-12 md:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="kicker flex items-center gap-1.5">
              <Trophy size={13} /> Goals
            </span>
            <Link href="/goals" className="text-sm font-semibold text-primary hover:underline">
              View
            </Link>
          </div>
          <div className="space-y-4">
            {goals.slice(0, 3).map((g) => (
              <div key={g.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">{g.name}</span>
                  <span className="tabnum text-muted">{pct(g.currentAmount, g.targetAmount)}%</span>
                </div>
                <ProgressBar value={pct(g.currentAmount, g.targetAmount)} hue="var(--c-savings)" />
              </div>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>
    </AppShell>
  );
}
