"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function BentoGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("bento-grid", className)}
      variants={reduce ? undefined : container}
      initial={reduce ? undefined : "hidden"}
      animate={reduce ? undefined : "show"}
    >
      {children}
    </motion.div>
  );
}

export function BentoCard({
  children,
  className,
  hover = true,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: "section" | "article" | "div";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag];
  return (
    <MotionTag
      variants={reduce ? undefined : item}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "card relative overflow-hidden p-5 transition-shadow duration-300 ease-out-quint",
        hover && "hover:shadow-card-hover",
        className
      )}
    >
      {children}
    </MotionTag>
  );
}

