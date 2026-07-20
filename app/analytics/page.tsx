"use client";

import { useState, useMemo } from "react";
import { Download, Sparkles, TrendingUp, Calendar, ChevronRight, Calculator } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BentoCard } from "@/components/Bento";
import { CategoryPie } from "@/components/charts/lazy";
import { CompareBar } from "@/components/charts/lazy";
import { TrendArea } from "@/components/charts/lazy";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";
import { monthTotals, netWorth } from "@/lib/selectors";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

const RANGES = [
  { label: "Quarterly View", months: 3 },
  { label: "6 Months View", months: 6 },
  { label: "Annual View", months: 12 },
];

export default function AnalyticsPage() {
  const { transactions, user, accounts } = useStore();
  const [range, setRange] = useState(6);

  const totals = monthTotals(transactions);
  const currentNetWorth = netWorth(accounts);

  // Dynamic story stats
  const savingsRate = totals.income ? Math.round((totals.net / totals.income) * 100) : 0;
  const yearlyForecast = totals.net * 12;

  return (
    <AppShell>
      {/* Editorial Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="kicker text-primary font-semibold">The long view</div>
          <h1 className="display text-3xl text-ink font-bold">Your financial story</h1>
          <p className="text-muted text-sm mt-1">Review trends, analyze your spend, and project future growth.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-pill bg-surface-2 p-1 border border-line">
            {RANGES.map((r) => (
              <button
                key={r.months}
                onClick={() => setRange(r.months)}
                className={cn(
                  "rounded-pill px-3 py-1.5 text-xs font-bold transition-colors",
                  range === r.months ? "bg-primary text-white" : "text-muted hover:text-ink"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="h-10 text-xs font-bold">
            <Download size={14} /> Print Report
          </Button>
        </div>
      </div>

      {/* Editorial Summary / Story Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5 bg-surface">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Net Earned (This Month)</div>
          <div className="display tabnum mt-1.5 text-2xl text-primary font-bold">
            {formatMoney(totals.income, user.currency)}
          </div>
          <div className="text-xs text-muted mt-2">Received across all verified deposit streams</div>
        </div>
        
        <div className="card p-5 bg-surface">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Net Spent (This Month)</div>
          <div className="display tabnum mt-1.5 text-2xl text-[#DC2626] font-bold">
            {formatMoney(totals.expense, user.currency)}
          </div>
          <div className="text-xs text-muted mt-2">Deducted from connected banks &amp; credit lines</div>
        </div>

        <div className="card p-5 bg-surface">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Saved (This Month)</div>
          <div className="display tabnum mt-1.5 text-2xl text-primary font-bold">
            {formatMoney(totals.net, user.currency)}
          </div>
          <div className="text-xs text-muted mt-2">Added directly to your cumulative Net Worth</div>
        </div>
      </div>

      {/* Intelligent Narrative Story & Forecast card */}
      <div className="card p-6 bg-primary/5 border border-primary/15 mb-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <Sparkles size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink mb-1">Savings Trend &amp; Forecast</h2>
            <p className="text-sm text-muted leading-relaxed max-w-3xl">
              Based on this month&apos;s positive cash flow, you maintained a stellar savings rate of{" "}
              <span className="font-bold text-ink">{savingsRate}%</span>. 
              At your current velocity, you are on track to save approximately{" "}
              <span className="font-bold text-primary">{formatMoney(yearlyForecast, user.currency)}</span> over the next 12 months. 
              This will increase your current net worth to{" "}
              <span className="font-bold text-ink">{formatMoney(currentNetWorth + yearlyForecast, user.currency)}</span>. 
              Keep moving toward your goals!
            </p>
          </div>
        </div>
      </div>

      {/* Primary Comparative Chart */}
      <BentoCard className="mb-6 p-6 bg-surface" hover={false}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="kicker text-muted">Income Comparison</span>
            <h3 className="text-lg font-bold text-ink">Income vs Expense trends</h3>
          </div>
          <span className="text-xs text-muted font-semibold">Last {range} months</span>
        </div>
        <CompareBar months={range} />
      </BentoCard>

      {/* Secondary split analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BentoCard hover={false} className="p-6 bg-surface">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="kicker text-muted">Cash Flow Trend</span>
              <h3 className="text-lg font-bold text-ink">Growth area map</h3>
            </div>
            <span className="text-xs text-muted font-semibold">Last {range} months</span>
          </div>
          <TrendArea months={range} />
        </BentoCard>
        
        <BentoCard hover={false} className="p-6 bg-surface">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="kicker text-muted">Category Split</span>
              <h3 className="text-lg font-bold text-ink">Where your money is going</h3>
            </div>
            <span className="text-xs text-muted font-semibold">This Month</span>
          </div>
          <CategoryPie />
        </BentoCard>
      </div>
    </AppShell>
  );
}

