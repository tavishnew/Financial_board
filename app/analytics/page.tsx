"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BentoCard } from "@/components/Bento";
import { CategoryPie } from "@/components/charts/CategoryPie";
import { CompareBar } from "@/components/charts/CompareBar";
import { TrendArea } from "@/components/charts/TrendArea";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";
import { monthTotals } from "@/lib/selectors";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

const RANGES = [
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
];

export default function AnalyticsPage() {
  const { transactions, user } = useStore();
  const [range, setRange] = useState(6);

  const totals = monthTotals(transactions);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kicker">The long view</div>
          <h1 className="display text-3xl text-ink">Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-pill bg-surface-2 p-1">
            {RANGES.map((r) => (
              <button
                key={r.months}
                onClick={() => setRange(r.months)}
                className={cn(
                  "rounded-pill px-3 py-1.5 text-sm font-semibold transition-colors",
                  range === r.months ? "bg-primary text-white" : "text-muted hover:text-ink"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download size={16} /> Report
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Income (this month)" value={formatMoney(totals.income, user.currency)} hue="var(--c-income)" />
        <Stat label="Expense (this month)" value={formatMoney(totals.expense, user.currency)} hue="var(--c-bills)" />
        <Stat label="Net (this month)" value={formatMoney(totals.net, user.currency)} hue="var(--primary)" />
      </div>

      <BentoCard className="mb-4" hover={false}>
        <div className="mb-3 flex items-center justify-between">
          <span className="kicker">Income vs expense</span>
          <span className="text-sm text-muted">Last {range} months</span>
        </div>
        <CompareBar months={range} />
      </BentoCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <BentoCard hover={false}>
          <div className="mb-3 flex items-center justify-between">
            <span className="kicker">Trend</span>
            <span className="text-sm text-muted">Last {range} months</span>
          </div>
          <TrendArea months={range} />
        </BentoCard>
        <BentoCard hover={false}>
          <div className="mb-3 flex items-center justify-between">
            <span className="kicker">Category split</span>
            <span className="text-sm text-muted">This month</span>
          </div>
          <CategoryPie />
        </BentoCard>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, hue }: { label: string; value: string; hue: string }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="display tabnum mt-1 text-2xl" style={{ color: hue }}>
        {value}
      </div>
    </div>
  );
}
