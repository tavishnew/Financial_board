"use client";

import { type LucideIcon } from "lucide-react";
import { CountUp } from "./CountUp";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  hue?: string;
  hero?: boolean;
}

export function StatCard({
  label,
  value,
  format,
  delta,
  deltaLabel,
  icon: Icon,
  hue = "var(--primary)",
  hero = false,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-start justify-between">
        <span className="kicker">{label}</span>
        {Icon && (
          <span
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{ background: `color-mix(in oklch, ${hue} 18%, transparent)`, color: hue }}
          >
            <Icon size={18} strokeWidth={2.4} />
          </span>
        )}
      </div>
      <div>
        <div
          className={cn(
            "display tabnum text-ink",
            hero ? "text-[clamp(2.25rem,5vw,3.4rem)]" : "text-[clamp(1.6rem,3vw,2.25rem)]"
          )}
        >
          <CountUp value={value} format={format} />
        </div>
        {delta !== undefined && (
          <div className="mt-1 flex items-center gap-1.5 text-sm">
            <span
              className={cn(
                "tabnum font-semibold",
                positive ? "text-primary" : "text-[color:var(--c-bills)]"
              )}
            >
              {positive ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
            </span>
            {deltaLabel && <span className="text-muted">{deltaLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

