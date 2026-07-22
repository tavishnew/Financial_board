"use client";

import { CATEGORY_META } from "@/lib/categories";
import { clsx } from "clsx";
import type { CategoryKey } from "@/lib/categories";

interface CategoryBadgeProps {
  categoryKey?: CategoryKey;
  categoryId?: string;
  categories?: { id: string; key: string; name: string }[];
  size?: "sm" | "md";
}

export function CategoryBadge({ categoryKey, categoryId, categories, size = "md" }: CategoryBadgeProps) {
  let key: CategoryKey | undefined = categoryKey;
  
  if (!key) {
    if (!categoryId || !categories) return null;
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return null;
    key = cat.key as CategoryKey;
  }
  
  if (!key) return null;
  const meta = CATEGORY_META[key];
  if (!meta) return null;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        size === "sm" && "px-1.5 py-0",
        size === "md" && "px-2 py-0.5"
      )}
      style={{ backgroundColor: meta.hue, color: "white" }}
    >
      <meta.icon className="h-3 w-3" />
      {meta.name}
    </span>
  );
}