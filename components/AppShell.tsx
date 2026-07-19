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
  Search,
  ChevronDown,
} from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { QuickAdd } from "./QuickAdd";
import { useStore } from "@/lib/store";
import { budgetProgress } from "@/lib/selectors";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/reports", label: "Reports", icon: RefreshCw },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { transactions, budgets, categories, user } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const alerts = budgetProgress(transactions, budgets, categories).filter((b) => b.over);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr] bg-[#F8F7F4] dark:bg-[#0F172A]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-[#1F2937] border-r border-[#2D3748] p-5 lg:flex">
        {/* Workspace switcher / Profile Menu */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-white/10 mb-4 text-white">
          <div className="h-9 w-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#2563EB]/25">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Personal Space</div>
            <div className="text-sm font-bold truncate text-slate-100">{user.name}</div>
          </div>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </div>

        {/* Search */}
        <div className="relative mb-4 px-2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search workspace..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/50 transition-all"
          />
        </div>

        {/* Navigation links */}
        <nav className="mt-2 flex-1 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={18} strokeWidth={2.3} className={cn(active ? "text-white" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="pt-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-2 px-2 text-slate-400 text-xs font-semibold">
            <Logo size={20} className="text-[#2563EB]" />
            <span>Finboard v1.0</span>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#1F2937] p-5 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-white">
              <Logo className="text-[#2563EB]" />
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 outline-none"
              />
            </div>

            <nav className="space-y-1 flex-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                      active ? "bg-[#2563EB] text-white" : "text-slate-300 hover:bg-white/5"
                    )}
                  >
                    <Icon size={18} strokeWidth={2.3} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            <div className="pt-4 border-t border-white/10 text-slate-400 text-xs">
              Signed in as <span className="font-semibold text-white">{user.name}</span>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 py-3 backdrop-blur lg:px-8">
          <button onClick={() => setMobileOpen(true)} className="text-ink lg:hidden" aria-label="Open menu">
            <Menu size={22} />
          </button>
          
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-pill bg-[#2563EB]/10 text-[#2563EB] tracking-wide uppercase">
              Workspace
            </span>
          </div>

          <div className="flex-1" />
          
          <div className="relative">
            <button
              onClick={() => setAlertsOpen((v) => !v)}
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} strokeWidth={2.3} />
              {alerts.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-danger text-[10px] font-bold text-white animate-pulse">
                  {alerts.length}
                </span>
              )}
            </button>
            {alertsOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-line bg-surface p-4 shadow-xl">
                <div className="mb-2 px-1 text-xs font-bold text-muted uppercase tracking-wider">Workspace Alerts</div>
                {alerts.length === 0 && <div className="px-1 text-sm text-slate-500">Your accounts are in great shape.</div>}
                {alerts.map((a) => (
                  <div key={a.budget.id} className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-surface-2 transition-colors text-sm">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
                    <span className="text-muted">
                      Over budget on <span className="font-semibold text-ink">{a.category?.name}</span> by{" "}
                      <span className="font-semibold text-ink">{formatMoney(Math.abs(a.remaining), user.currency)}</span>
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
        <main className="flex-1 px-4 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 z-40 flex h-16 items-center justify-around border-t border-line bg-surface/90 px-2 py-2 backdrop-blur lg:hidden">
          {NAV.slice(0, 5).map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "grid h-11 w-14 place-items-center rounded-xl transition-all",
                  active ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25" : "text-muted hover:text-ink"
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


