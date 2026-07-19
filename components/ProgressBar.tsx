"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  hue,
  height = 10,
  className,
}: {
  value: number;
  hue: string;
  height?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));
  const over = value > 100;
  const fill = over ? "var(--c-bills)" : hue;
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-surface-2", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: fill }}
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />
    </div>
  );
}

