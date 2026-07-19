"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grain relative grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-primary/25 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute right-10 top-1/3 h-80 w-80 rounded-full bg-accent/20 blur-[130px]" />

      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between p-12 lg:flex">
        <Logo />
        <div className="max-w-md">
          <h1 className="display text-balance text-[clamp(2.25rem,4vw,3.5rem)] text-ink">
            Money that looks <span style={{ color: "var(--primary)" }}>alive</span>.
          </h1>
          <p className="mt-4 text-lg text-muted">
            A maximalist bento dashboard for people who want clarity, not
            spreadsheet fatigue.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted">
            {["Track every account in one net worth", "Live category breakdown", "Budgets that turn red before you overshoot"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/15 text-primary">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-muted">
          © {new Date().getFullYear()} MoneyTrail
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="hidden lg:block">
          <div className="flex justify-end p-6">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">
            <h2 className="display text-3xl text-ink">{title}</h2>
            <p className="mt-2 text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-center text-sm text-muted">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


