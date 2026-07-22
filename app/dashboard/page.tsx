"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingDown, Trophy, Sparkles, AlertCircle, Calendar, CreditCard, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BentoGrid, BentoCard } from "@/components/Bento";
import { CountUp } from "@/components/CountUp";
import { ProgressBar } from "@/components/ProgressBar";
import { CategoryPie } from "@/components/charts/lazy";
import { MiniTrend } from "@/components/charts/lazy";
import { TransactionRow } from "@/components/TransactionRow";
import { QuickAdd } from "@/components/QuickAdd";
import { InvestmentsCard } from "@/components/InvestmentsCard";
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
  const recent = recentTransactions(transactions, 5);
  const budgetsProgress = budgetProgress(transactions, budgets, categories).slice(0, 3);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Calculate some simple insights
  const savingsRate = totals.income ? Math.round((totals.net / totals.income) * 100) : 0;
  const isHealthy = savingsRate >= 20;

  return (
    <AppShell>
      {/* Welcome Hero / Editorial Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="kicker text-primary font-bold">{greet}, {user.name}</span>
          <h1 className="display text-4xl mt-1 tracking-tight text-ink font-extrabold">Your financial story</h1>
          <p className="text-muted text-sm mt-1">Keep moving toward your goals Â· Here is where your money is going this month.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/transactions">
            <button className="h-10 px-4 rounded-xl border border-line bg-surface text-ink text-sm font-semibold hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5 shadow-sm">
              <Calendar size={15} /> Calendar View
            </button>
          </Link>
          <QuickAdd />
        </div>
      </div>

      <div className="space-y-6">
        {/* Asymmetrical Row 1: Net Worth + Snapshot */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Welcome Hero Card / Net Worth */}
          <div className="md:col-span-8 card p-6 bg-surface relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="kicker text-muted">Net Worth Overview</span>
                <span className="rounded-pill bg-[#22C55E]/10 px-2.5 py-1 text-xs font-bold text-primary">
                  â–² {savingsRate}% saved this month
                </span>
              </div>
              <div className="display tabnum mt-3 text-[clamp(2.5rem,5vw,3.75rem)] text-ink leading-none">
                <CountUp value={nw} format={(n) => formatMoney(n, user.currency)} />
              </div>
              <div className="mt-2 text-sm text-muted">
                Across {accounts.filter((a) => !a.archived).length} active financial accounts
              </div>
            </div>
            
            <div className="mt-6">
              <MiniTrend />
            </div>
          </div>

          {/* Monthly Snapshot Card */}
          <div className="md:col-span-4 card p-6 bg-surface flex flex-col justify-between">
            <div>
              <span className="kicker text-muted">Monthly Snapshot</span>
              
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase tracking-wider">
                    <TrendingDown size={13} className="text-[#DC2626]" /> Spent
                  </div>
                  <div className="display tabnum text-2xl text-ink font-bold mt-0.5">
                    <CountUp value={totals.expense} format={(n) => formatMoney(n, user.currency)} />
                  </div>
                </div>
                
                <div className="border-t border-line my-2" />

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase tracking-wider">
                    <ArrowUpRight size={13} className="text-primary" /> Earned
                  </div>
                  <div className="display tabnum text-2xl text-primary font-bold mt-0.5">
                    <CountUp value={totals.income} format={(n) => formatMoney(n, user.currency)} />
                  </div>
                </div>
              </div>
            </div>

            {top && topMeta && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-surface-2 p-2.5">
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg"
                  style={{ background: `color-mix(in oklch, ${topMeta.hue} 15%, transparent)`, color: topMeta.hue }}
                >
                  <topMeta.icon size={16} strokeWidth={2.4} />
                </span>
                <div className="text-xs min-w-0 flex-1">
                  <div className="text-muted truncate">Top category</div>
                  <div className="font-bold text-ink truncate">
                    {topMeta.name} Â· {formatMoney(top.amount, user.currency)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Financial Health Insight Banner */}
        <div className="card p-5 bg-primary/5 border border-primary/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Sparkles size={18} />
            </span>
            <div>
              <h3 className="font-bold text-ink text-sm">Financial Health Insight</h3>
              <p className="text-xs text-muted mt-0.5">
                {isHealthy 
                  ? "Outstanding! You have maintained a premium savings rate above 20% this month. You're on target."
                  : "Consider reviewing your optional subscription bills or budgets to increase your savings rate above 20%."}
              </p>
            </div>
          </div>
          <Link href="/analytics">
            <button className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 shrink-0">
              View Analytics <ChevronRight size={14} />
            </button>
          </Link>
        </div>

        {/* Investments: live-tracked stock/ETF holdings */}
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-12">
            <InvestmentsCard />
          </div>
        </div>

        {/* Asymmetrical Row 3: Budgets & Savings Goals */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Budget progress */}
          <div className="md:col-span-7 card p-6 bg-surface">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <span className="kicker text-muted">Budget Progress</span>
                <h3 className="text-lg font-bold text-ink">This month&apos;s progress</h3>
              </div>
              <Link href="/budgets" className="text-xs font-bold text-primary hover:underline">
                Manage Budgets
              </Link>
            </div>
            
            <div className="space-y-4">
              {budgetsProgress.length === 0 && (
                <p className="text-sm text-muted py-4 text-center">No budgets configured yet. Establish guardrails to track your limits.</p>
              )}
              {budgetsProgress.map((b) => {
                const meta = b.category ? CATEGORY_META[b.category.key] : null;
                return (
                  <div key={b.budget.id} className="group">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink group-hover:text-primary transition-colors">{b.category?.name}</span>
                      <span className="tabnum text-muted">
                        {formatMoney(b.spent, user.currency)} of {formatMoney(b.limit, user.currency)}
                      </span>
                    </div>
                    <ProgressBar value={b.pct} hue={meta?.hue ?? "var(--primary)"} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="md:col-span-5 card p-6 bg-surface flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="kicker text-muted">Savings Goals</span>
                  <h3 className="text-lg font-bold text-ink">Target milestones</h3>
                </div>
                <Link href="/goals" className="text-xs font-bold text-primary hover:underline">
                  All Goals
                </Link>
              </div>
              
              <div className="space-y-4">
              {goals.slice(0, 2).map((g) => {
                  const p = pct(g.currentAmount, g.targetAmount);
                  return (
                    <div key={g.id}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-ink">{g.name}</span>
                        <span className="tabnum text-muted font-semibold">{p}% there</span>
                      </div>
                      <ProgressBar value={p} hue="var(--c-savings)" />
                    </div>
                  );
                })}
                {goals.length === 0 && (
                  <p className="text-sm text-muted py-4 text-center">No savings goals created. Set your sights on something meaningful.</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line text-xs flex items-center gap-1.5 text-muted">
              <Trophy size={14} className="text-[#F59E0B]" />
              <span>Watch your savings grow on target.</span>
            </div>
          </div>
        </div>

        {/* Asymmetrical Row 4: Recent Transactions & Category Breakdown */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Category breakdown (editorial view) */}
          <div className="md:col-span-7 card p-6 bg-surface">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="kicker text-muted">Allocation</span>
                <h3 className="text-lg font-bold text-ink">Where your money is going</h3>
              </div>
              <span className="text-xs text-muted font-semibold">This Month</span>
            </div>
            
            <div className="py-2 flex justify-center">
              <CategoryPie />
            </div>
          </div>

          {/* Recent transactions */}
          <div className="md:col-span-5 card p-6 bg-surface flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="kicker text-muted">Ledger</span>
                  <h3 className="text-lg font-bold text-ink">Recent transactions</h3>
                </div>
                <Link href="/transactions" className="text-xs font-bold text-primary hover:underline">
                  See Ledger
                </Link>
              </div>
              
              <div className="divide-y divide-line max-h-[260px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden scrollbar-none">
                {recent.map((t) => (
                  <TransactionRow key={t.id} txn={t} />
                ))}
                {recent.length === 0 && (
                  <p className="text-sm text-muted py-8 text-center">No transactions registered.</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line text-xs text-muted flex items-center justify-between">
              <span>Updated in real-time</span>
              <span className="font-bold text-primary">All secure</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

