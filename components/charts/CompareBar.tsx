"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

export function CompareBar({ months = 6 }: { months?: number }) {
  const { transactions, user } = useStore();
  const txns = transactions.length ? transactions : DEMO_TRANSACTIONS;
  const data = useMemo(() => monthlyTrend(txns, months), [txns]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={4}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tick={{ fill: "var(--muted)", fontSize: 12 }}
          tickFormatter={(v) => formatCompact(Number(v), user.currency)}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--surface-2)" }} />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "var(--muted)" }}
        />
        <Bar dataKey="income" name="Income" fill="var(--c-income)" radius={[6, 6, 0, 0]} animationDuration={800} />
        <Bar dataKey="expense" name="Expense" fill="var(--c-bills)" radius={[6, 6, 0, 0]} animationDuration={800} />
      </BarChart>
    </ResponsiveContainer>
  );
}

