"use client";

import { useState } from "react";
import { Plus, Landmark, CreditCard, Wallet, PiggyBank, Archive, ArchiveRestore } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CountUp } from "@/components/CountUp";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { netWorth } from "@/lib/selectors";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AccountType } from "@/lib/types";

const TYPE_META: Record<AccountType, { icon: typeof Wallet; label: string }> = {
  bank: { icon: Landmark, label: "Bank" },
  card: { icon: CreditCard, label: "Card" },
  cash: { icon: Wallet, label: "Cash" },
  wallet: { icon: PiggyBank, label: "Wallet" },
};

export default function AccountsPage() {
  const { accounts, user, addAccount, archiveAccount } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [balance, setBalance] = useState("");

  const active = accounts.filter((a) => !a.archived);
  const archived = accounts.filter((a) => a.archived);
  const total = netWorth(accounts);

  function add() {
    if (!name) return;
    addAccount({ name, type, balance: Number(balance) || 0, archived: false });
    setName("");
    setBalance("");
    setType("bank");
    setShowAdd(false);
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kicker">All your money, in one place</div>
          <h1 className="display text-3xl text-ink">Accounts</h1>
        </div>
        <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
          <Plus size={16} /> Add account
        </Button>
      </div>

      {/* Net worth hero */}
      <div className="card mb-4 relative overflow-hidden p-6">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />
        <div className="kicker">Net worth</div>
        <div className="display tabnum mt-1 text-[clamp(2.25rem,6vw,3.5rem)] text-ink">
          <CountUp value={total} format={(n) => formatMoney(n, user.currency)} />
        </div>
      </div>

      {showAdd && (
        <div className="card mb-4 flex flex-wrap items-end gap-3 p-4">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Salary Account"
              className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none"
            >
              {Object.entries(TYPE_META).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Balance</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm tabnum text-ink outline-none"
            />
          </div>
          <Button onClick={add}>Add</Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {active.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              icon={Plus}
              title="No accounts yet"
              description="Add your first bank, card or cash account to see your net worth."
            />
          </div>
        )}
        {active.map((a) => {
          const meta = TYPE_META[a.type];
          const Icon = meta.icon;
          const negative = a.balance < 0;
          return (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <Icon size={22} strokeWidth={2.3} />
                </span>
                <button
                  onClick={() => archiveAccount(a.id)}
                  className="rounded-xl p-2 text-muted hover:bg-surface-2 hover:text-ink"
                  aria-label="Archive account"
                >
                  <Archive size={16} />
                </button>
              </div>
              <div className="mt-4 text-sm font-semibold text-muted">{a.name}</div>
              <div className={cn("display tabnum text-2xl", negative ? "text-[color:var(--c-bills)]" : "text-ink")}>
                {formatMoney(a.balance, user.currency, { signed: true })}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted">{meta.label}</div>
            </div>
          );
        })}
      </div>

      {archived.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Archived</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((a) => {
              const meta = TYPE_META[a.type];
              const Icon = meta.icon;
              return (
                <div key={a.id} className="card flex items-center gap-3 p-4 opacity-70">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-surface-2 text-muted">
                    <Icon size={20} strokeWidth={2.3} />
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-ink">{a.name}</div>
                    <div className="tabnum text-sm text-muted">{formatMoney(a.balance, user.currency, { signed: true })}</div>
                  </div>
                  <button
                    onClick={() => archiveAccount(a.id)}
                    className="rounded-xl p-2 text-muted hover:bg-surface-2 hover:text-ink"
                    aria-label="Restore account"
                  >
                    <ArchiveRestore size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}

