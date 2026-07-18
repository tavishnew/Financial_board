import {
  Utensils,
  Bus,
  ShoppingBag,
  FileText,
  Gamepad2,
  HeartPulse,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";
import type { CategoryKey } from "./types";

export interface CategoryMeta {
  name: string;
  colorVar: string;
  hue: string; // oklch string, stable across themes
  icon: LucideIcon;
}

export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  food: { name: "Food", colorVar: "var(--c-food)", hue: "oklch(0.72 0.16 60)", icon: Utensils },
  transport: { name: "Transport", colorVar: "var(--c-transport)", hue: "oklch(0.65 0.16 250)", icon: Bus },
  shopping: { name: "Shopping", colorVar: "var(--c-shopping)", hue: "oklch(0.62 0.20 300)", icon: ShoppingBag },
  bills: { name: "Bills", colorVar: "var(--c-bills)", hue: "oklch(0.62 0.20 20)", icon: FileText },
  fun: { name: "Fun", colorVar: "var(--c-fun)", hue: "oklch(0.68 0.18 350)", icon: Gamepad2 },
  health: { name: "Health", colorVar: "var(--c-health)", hue: "oklch(0.72 0.14 195)", icon: HeartPulse },
  savings: { name: "Savings", colorVar: "var(--c-savings)", hue: "oklch(0.75 0.15 160)", icon: PiggyBank },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "food",
  "transport",
  "shopping",
  "bills",
  "fun",
  "health",
  "savings",
];

export const INCOME_HUE = "oklch(0.78 0.17 145)";
export const INCOME_COLOR_VAR = "var(--c-income)";
