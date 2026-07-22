"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ size = 28, className, clickable = false }: { size?: number; className?: string; clickable?: boolean }) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" />
        <path d="M10 20C12 15 20 15 22 12" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="22" cy="12" r="3" fill="var(--primary)" />
      </svg>
      <span className="display text-lg font-extrabold tracking-tight">MoneyTrail</span>
    </span>
  );
  if (clickable) {
    return (
      <Link href="/" className="no-underline hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
}
