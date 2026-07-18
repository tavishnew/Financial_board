import type { TooltipProps } from "recharts";

export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-2xl border border-line bg-surface px-3 py-2 text-xs shadow-card">
      {label && <div className="mb-1 font-semibold text-ink">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-muted">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: (p.color as string) || "var(--primary)" }}
          />
          <span className="text-ink">{p.name}</span>
          <span className="tabnum ml-auto font-semibold text-ink">
            {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
