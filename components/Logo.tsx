"use client";

import { cn } from "@/lib/cn";

export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="13" height="13" rx="4" fill="var(--primary)" />
        <rect x="17" y="2" width="13" height="13" rx="4" fill="var(--accent)" />
        <rect x="2" y="17" width="13" height="13" rx="4" fill="var(--accent)" />
        <rect x="17" y="17" width="13" height="13" rx="4" fill="var(--primary)" />
      </svg>
      <span className="display text-lg font-extrabold tracking-tight text-ink">Finboard</span>
    </span>
  );
}
