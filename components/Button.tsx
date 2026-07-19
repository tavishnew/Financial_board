"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "soft" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-press shadow-[var(--shadow-glow)] hover:-translate-y-0.5",
  ghost: "bg-transparent text-ink hover:bg-surface-2",
  soft: "bg-surface-2 text-ink hover:bg-line/60",
  danger: "bg-danger text-white hover:opacity-90",
  outline: "bg-transparent text-ink border border-line hover:border-primary hover:text-primary",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-11 px-5 text-[0.95rem] rounded-2xl",
  lg: "h-13 px-7 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 ease-out-quint disabled:opacity-50 disabled:pointer-events-none active:translate-y-0",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

