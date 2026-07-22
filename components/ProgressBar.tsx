"use client";

import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

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
      className={clsx("w-full overflow-hidden rounded-full bg-surface-2", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full w-full rounded-full"
        style={{ background: fill, transformOrigin: "left center" }}
        initial={reduce ? false : { transform: "scaleX(0)" }}
        animate={{ transform: `scaleX(${clamped / 100})` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />
    </div>
  );
}

