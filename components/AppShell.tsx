"use client";

import { useEffect, useState, type ReactNode } from "react";
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
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
  const [bottomNavOpen, setBottomNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Topbar is hidden by default and reveals only when the pointer nears the top
  // edge (or hovers the bar itself), then smoothly slides away. On small/touch
  // screens it stays visible since there is no hover.
  const [topNear, setTopNear] = useState(false);
  const [topHover, setTopHover] = useState(false);
  const topVisible = topNear || topHover;

  useEffect(() => {
    const onMove = (e: MouseEvent) => setTopNear(e.clientY <= 96);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const alerts = budgetProgress(transactions, budgets, categories).filter((b) => b.over);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Sidebar (desktop) */}
        <aside
          className={
            "fixed left-0 top-0 z-40 hidden h-screen flex-col bg-[#1A1611] border-r border-[#2C2620] p-5 transition-[transform,opacity] duration-300 ease-out-quint lg:flex " +
            (sidebarOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0 pointer-events-none")
          }
        >
        {/* Workspace switcher / Profile Menu */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-white/10 mb-4 text-white">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/25">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              user.name?.charAt(0).toUpperCase()
            )}
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
          className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
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
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
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
            <Logo size={20} className="text-primary" />
            <span>MoneyTrail v1.0</span>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 bg-[#1A1611] p-5 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-white">
              <Logo className="text-primary" />
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
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                      active ? "bg-primary text-white" : "text-slate-300 hover:bg-white/5"
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

      <div className={cn("flex min-h-screen flex-col lg:transition-[padding] lg:duration-300", sidebarOpen && "lg:pl-[260px]")}>
      {/* Topbar — hidden until the pointer nears the top edge or hovers the bar */}
      <header
        onMouseEnter={() => setTopHover(true)}
        onMouseLeave={() => setTopHover(false)}
        className={
          "sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 py-3 backdrop-blur transition-[transform,margin,opacity] duration-500 ease-out-quint lg:px-8 " +
          (topVisible
            ? "translate-y-0 opacity-100 mt-0"
            : "md:-translate-y-full md:opacity-0 md:-mt-16 md:pointer-events-none")
        }
      >
          <button onClick={() => setMobileOpen(true)} className="text-ink lg:hidden" aria-label="Open menu">
            <Menu size={22} />
          </button>

          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden text-ink transition-colors hover:text-primary lg:inline-flex"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
          </button>
          
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-pill bg-primary/10 text-primary tracking-wide uppercase">
              Workspace
            </span>
          </div>

          <div className="flex-1" />
          
          <div className="relative">
            <button
              onClick={() => setAlertsOpen((v) => !v)}
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink hover:border-primary hover:text-primary transition-colors"
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

        {/* Mobile bottom nav — hidden until toggled via the arrow button */}
        <nav
          className={
            "fixed bottom-0 inset-x-0 z-40 flex h-16 items-center justify-around gap-2 border-t border-line bg-surface/90 px-2 pr-14 py-2 backdrop-blur transition-[transform,opacity] duration-300 ease-out-quint lg:hidden " +
            (bottomNavOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none")
          }
        >
          {NAV.slice(0, 5).map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setBottomNavOpen(false)}
                className={cn(
                  "grid h-11 w-14 place-items-center rounded-xl transition-colors",
                  active ? "bg-primary text-white shadow-md shadow-primary/25" : "text-muted hover:text-ink"
                )}
              >
                <Icon size={20} strokeWidth={2.3} />
              </Link>
            );
          })}
        </nav>

        {/* Arrow toggle for the mobile bottom nav */}
        <button
          type="button"
          onClick={() => setBottomNavOpen((v) => !v)}
          aria-label={bottomNavOpen ? "Hide navigation" : "Show navigation"}
          aria-expanded={bottomNavOpen}
          className="fixed bottom-4 right-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform duration-300 ease-out-quint lg:hidden"
        >
          <ChevronUp
            size={22}
            strokeWidth={2.4}
            className={cn("transition-transform duration-300", bottomNavOpen ? "rotate-180" : "")}
          />
        </button>
      </div>
    </div>
  );
}



