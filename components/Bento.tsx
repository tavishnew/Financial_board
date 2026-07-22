"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import clsx from "clsx";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, transform: "translateY(14px)" },
  show: { opacity: 1, transform: "translateY(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
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
      className={clsx("bento-grid", className)}
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
      className={clsx(
        "card relative overflow-hidden p-5 transition-shadow duration-300 ease-out-quint",
        hover && "hover:shadow-card-hover",
        className
      )}
    >
      {children}
    </MotionTag>
  );
}

