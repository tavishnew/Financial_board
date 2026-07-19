"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store";
import { monthlyTrend } from "@/lib/selectors";
import { DEMO_TRANSACTIONS } from "@/lib/demo";
import { formatCompact } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

export function TrendArea({ months = 6 }: { months?: number }) {
  const { transactions, user } = useStore();
  const txns = transactions.length ? transactions : DEMO_TRANSACTIONS;
  const data = useMemo(() => monthlyTrend(txns, months), [txns]);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--c-income)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--c-income)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--c-bills)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--c-bills)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tick={{ fill: "var(--muted)", fontSize: 12 }}
          tickFormatter={(v) => formatCompact(Number(v), user.currency)}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--line)" }} />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="var(--c-income)"
          strokeWidth={2.5}
          fill="url(#gIncome)"
          animationDuration={900}
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="Expense"
          stroke="var(--c-bills)"
          strokeWidth={2.5}
          fill="url(#gExpense)"
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

