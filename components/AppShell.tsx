"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  LineChart,
  Wallet,
  Target,
  RefreshCw,
  Settings,
  Bell,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { QuickAdd } from "./QuickAdd";
import { useStore } from "@/lib/store";
import { budgetProgress } from "@/lib/selectors";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/recurring", label: "Recurring", icon: RefreshCw },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { transactions, budgets, categories, user } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const alerts = budgetProgress(transactions, budgets, categories).filter((b) => b.over);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface/60 p-4 lg:flex">
        <div className="px-2 py-3">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        <nav className="mt-2 flex-1 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active ? "bg-primary text-on-primary shadow-[var(--shadow-glow)]" : "text-muted hover:bg-surface-2 hover:text-ink"
                )}
              >
                <Icon size={18} strokeWidth={2.3} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="rounded-2xl bg-surface-2 p-3 text-xs text-muted">
          Signed in as <span className="font-semibold text-ink">{user.name}</span>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-line bg-surface p-4">
            <div className="flex items-center justify-between px-2 py-3">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="text-muted">
                <X size={20} />
              </button>
            </div>
            <nav className="mt-2 space-y-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold",
                      active ? "bg-primary text-on-primary" : "text-muted hover:bg-surface-2 hover:text-ink"
                    )}
                  >
                    <Icon size={18} strokeWidth={2.3} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur lg:px-8">
          <button onClick={() => setMobileOpen(true)} className="text-ink lg:hidden" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setAlertsOpen((v) => !v)}
              className="relative grid h-10 w-10 place-items-center rounded-2xl border border-line bg-surface text-ink hover:border-primary hover:text-primary"
              aria-label="Notifications"
            >
              <Bell size={18} strokeWidth={2.3} />
              {alerts.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-danger text-[10px] font-bold text-white">
                  {alerts.length}
                </span>
              )}
            </button>
            {alertsOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-line bg-surface p-3 shadow-card">
                <div className="mb-2 px-1 text-sm font-bold text-ink">Alerts</div>
                {alerts.length === 0 && <div className="px-1 text-sm text-muted">You&apos;re all good.</div>}
                {alerts.map((a) => (
                  <div key={a.budget.id} className="flex items-start gap-2 rounded-xl p-2 text-sm">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[color:var(--c-bills)]" />
                    <span className="text-muted">
                      Over budget on <span className="font-semibold text-ink">{a.category?.name}</span> by{" "}
                      {formatMoney(Math.abs(a.remaining), user.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ThemeToggle />
          <QuickAdd />
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 z-40 flex items-center justify-around border-t border-line bg-surface/90 px-2 py-2 backdrop-blur lg:hidden">
          {NAV.slice(0, 5).map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "grid h-11 w-16 place-items-center rounded-2xl",
                  active ? "bg-primary text-on-primary" : "text-muted"
                )}
              >
                <Icon size={20} strokeWidth={2.3} />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
