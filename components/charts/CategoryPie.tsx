"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useStore } from "@/lib/store";
import { CATEGORY_META } from "@/lib/categories";
import { categorySpend } from "@/lib/selectors";
import { formatCompact, formatMoney } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

export function CategoryPie({ monthsAgo = 0 }: { monthsAgo?: number }) {
  const { transactions, categories, user } = useStore();

  const data = useMemo(() => {
    const spend = categorySpend(transactions, monthsAgo);
    return categories
      .map((c) => ({
        key: c.id,
        name: c.name,
        value: spend[c.id] ?? 0,
        hue: CATEGORY_META[c.key].hue,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, monthsAgo]);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return <div className="grid h-44 place-items-center text-sm text-muted">No spend yet.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              stroke="none"
              isAnimationActive
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.hue} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-[0.65rem] uppercase tracking-widest text-muted">Spend</div>
            <div className="display tabnum text-lg text-ink">{formatCompact(total, user.currency)}</div>
          </div>
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 sm:flex-1">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.hue }} />
            <span className="truncate text-muted">{d.name}</span>
            <span className="tabnum ml-auto font-semibold text-ink">
              {formatMoney(d.value, user.currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

