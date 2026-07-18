"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`grid h-10 w-10 place-items-center rounded-2xl border border-line bg-surface text-ink transition-colors hover:border-primary hover:text-primary ${className}`}
    >
      {theme === "dark" ? <Sun size={18} strokeWidth={2.3} /> : <Moon size={18} strokeWidth={2.3} />}
    </button>
  );
}
