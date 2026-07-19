"use client";

import { CATEGORY_META } from "@/lib/categories";
import type { CategoryKey } from "@/lib/types";
import { cn } from "@/lib/cn";

export function CategoryBadge({
  categoryKey,
  showLabel = true,
  className,
}: {
  categoryKey: CategoryKey;
  showLabel?: boolean;
  className?: string;
}) {
  const meta = CATEGORY_META[categoryKey];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold",
        className
      )}
      style={{ background: `color-mix(in oklch, ${meta.hue} 16%, transparent)`, color: meta.hue }}
    >
      <Icon size={14} strokeWidth={2.4} />
      {showLabel && <span>{meta.name}</span>}
    </span>
  );
}

