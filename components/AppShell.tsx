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
import clsx from "clsx";

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

// WorkspaceSearch: search form for transactions (usersearch ? UsersearchForm)
export function WorkspaceSearch({ className, placeholder = "Search workspace..." }: { className?: string; placeholder?: string }) {
  return (
    <form action="/transactions" method="get" className={clsx("relative mb-4 px-2", className)}>
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
      <input
        type="text"
        name="q"
        placeholder={placeholder}
        className="h-9 w-full rounded-xl bg-white/5 border border-white/10 bg-transparent text-xs text-white placeholder:text-slate-400 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/50 pl-9 pr-3"
      />
    </form>
  );
}

// SidebarNavigation: navigation links for the sidebar
export function SidebarNavigation() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 mt-2 space-y-1">
      {NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
              active
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon size={18} strokeWidth={2.3} className={clsx(active ? "text-white" : "text-slate-400")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// UserAvatar: user avatar or initial display
export function UserAvatar({ url, name }: { url?: string; name?: string }) {
  return (
    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/25">
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : name?.charAt(0).toUpperCase()}
    </div>
  );
}

// AlertDropdown: notifications alert dropdown
export function AlertDropdown({
  open,
  onOpenChange,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: { category?: { name?: string }; remaining: number }[];
}) {
  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:border-primary hover:text-primary"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={2.3} />
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-danger text-[10px] font-bold text-white animate-pulse">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-line bg-surface p-4 shadow-xl">
          <div className="mb-2 px-1 text-xs font-bold text-muted uppercase tracking-wider">Workspace Alerts</div>
          {items.length === 0 && <div className="px-1 text-sm text-slate-500">Your accounts are in great shape.</div>}
          {items.map((a) => (
            <div key={a.category?.name} className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-surface-2 transition-colors text-sm">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
              <span className="text-muted">
                Over budget on <span className="font-semibold text-ink">{a.category?.name}</span> by{" "}
                <span className="font-semibold text-ink">{formatMoney(Math.abs(a.remaining))}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { transactions, budgets, categories, user } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [bottomNavOpen, setBottomNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Topbar: hidden by default, reveals on hover or near top edge
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
    <div className="min-h-screen bg-[var(--bg)]" data-testid="app-shell">
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col bg-[#1A1611] border-r border-[#2C2620] p-5 transition-[transform,opacity] duration-300 ease-out-quint lg:flex",
          sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
        )}
        data-testid="desktop-sidebar"
      >
        {/* UserProfile */}
        <div className="flex items-center gap-3 mb-4 px-2 py-3 border-b border-white/10 text-white">
          <UserAvatar url={user.avatarUrl} name={user.name} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Personal Space</div>
            <div className="text-sm font-bold truncate text-slate-100">{user.name}</div>
          </div>
        </div>

        <WorkspaceSearch />

        <SidebarNavigation />

        {/* SidebarFooter */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <QuickAdd className="w-full justify-center" />
          <div className="mt-3 flex items-center gap-2 px-2 text-xs font-semibold text-slate-400">
            <Logo size={20} className="text-primary" />
            <span>MoneyTrail v1.0</span>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" data-testid="mobile-sidebar-overlay">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#1A1611] p-5 flex flex-col" data-testid="mobile-sidebar">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-white">
              <Logo className="text-primary" />
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <WorkspaceSearch placeholder="Search..." />

            <nav className="space-y-1 flex-1">
              {NAV.slice(0, 5).map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
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

      {/* MainContentWrapper */}
      <div className={clsx("flex min-h-screen flex-col lg:transition-[padding] lg:duration-300", sidebarOpen && "lg:pl-[260px]")}>
        {/* Topbar */}
        <header
          onMouseEnter={() => setTopHover(true)}
          onMouseLeave={() => setTopHover(false)}
          className={clsx(
            "sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 py-3 backdrop-blur transition-[transform,margin,opacity] duration-500 ease-out-quint lg:px-8",
            topVisible ? "translate-y-0 opacity-100 mt-0" : "md:-translate-y-full md:opacity-0 md:-mt-16 md:pointer-events-none"
          )}
          data-testid="topbar"
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

          <AlertDropdown
            open={alertsOpen}
            onOpenChange={setAlertsOpen}
            items={alerts.map((a) => ({ category: a.category, remaining: a.remaining }))}
          />

          <ThemeToggle />
          <QuickAdd />
        </header>

        {/* MainContent */}
        <main className="flex-1 px-4 py-8 lg:px-10 lg:py-10" data-testid="main-content">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav
          className={clsx(
            "fixed bottom-0 inset-x-0 z-40 flex h-16 items-center justify-around gap-2 border-t border-line bg-surface/90 px-2 pr-14 py-2 backdrop-blur transition-[transform,opacity] duration-300 ease-out-quint lg:hidden",
            bottomNavOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
          )}
          data-testid="mobile-bottom-nav"
        >
          {NAV.slice(0, 5).map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setBottomNavOpen(false)}
                className={clsx(
                  "grid h-11 w-14 place-items-center rounded-xl transition-colors",
                  active ? "bg-primary text-white shadow-md shadow-primary/25" : "text-muted hover:text-ink"
                )}
              >
                <Icon size={20} strokeWidth={2.3} />
              </Link>
            );
          })}
        </nav>

        {/* Mobile Nav Toggle Button */}
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
            className={clsx("transition-transform duration-300", bottomNavOpen ? "rotate-180" : "")}
          />
        </button>

        {/* Add Transaction FAB */}
        <div className="fixed bottom-20 right-4 z-50 lg:hidden" data-testid="add-transaction-fab">
          <QuickAdd />
        </div>
      </div>
    </div>
  );
}
