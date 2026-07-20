"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { useStore } from "@/lib/store";
import { dailyTrend } from "@/lib/selectors";
import { DEMO_TRANSACTIONS } from "@/lib/demo";
import { ChartTooltip } from "./ChartTooltip";

export function MiniTrend({ days = 14, demo = false }: { days?: number; demo?: boolean }) {
  const { transactions } = useStore();
  const txns = demo ? DEMO_TRANSACTIONS : transactions;
  const data = useMemo(() => dailyTrend(txns, days), [txns, days]);

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gMini" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={[0, "dataMax"]} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--line)" }} />
        <Area
          type="monotone"
          dataKey="expense"
          name="Spend"
          stroke="var(--primary)"
          strokeWidth={2.5}
          fill="url(#gMini)"
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

