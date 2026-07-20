"use client";

import { useMemo, useState } from "react";
import { Plus, Pause, Play, RefreshCw, Trash2, Sparkles, Calendar, Clock, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { CATEGORY_META } from "@/lib/categories";
import { formatMoney, formatDay } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { CategoryKey } from "@/lib/types";

interface RecItem {
  id: string;
  name: string;
  categoryKey: CategoryKey;
  amount: number;
  nextDue: string;
  frequency: string;
  manual?: boolean;
}

export default function RecurringPage() {
  const { transactions, categories, user } = useStore();
  const [paused, setPaused] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [manual, setManual] = useState<RecItem[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState<CategoryKey>("bills");
  const [due, setDue] = useState("");

  const detected = useMemo<RecItem[]>(() => {
    const groups = new Map<string, { note: string; catId: string | null; dates: number[]; amounts: number[] }>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const key = `${t.note?.toLowerCase() ?? "x"}|${t.categoryId ?? "none"}`;
      const g = groups.get(key) ?? { note: t.note ?? "Recurring Bill", catId: t.categoryId, dates: [], amounts: [] };
      g.dates.push(+new Date(t.date));
      g.amounts.push(t.amount);
      groups.set(key, g);
    }
    const out: RecItem[] = [];
    for (const [key, g] of groups) {
      if (g.dates.length < 2) continue;
      g.dates.sort((a, b) => a - b);
      const last = g.dates[g.dates.length - 1];
      const interval = (last - g.dates[g.dates.length - 2]) / 86400000;
      const catObj = categories.find((c) => c.id === g.catId);
      if (!catObj) continue;
      const avg = g.amounts.reduce((s, a) => s + a, 0) / g.amounts.length;
      out.push({
        id: `det-${key}`,
        name: g.note,
        categoryKey: catObj.key,
        amount: Math.round(avg),
        nextDue: new Date(last + interval * 86400000).toISOString(),
        frequency: interval <= 9 ? "Weekly" : "Monthly",
      });
    }
    return out.sort((a, b) => +new Date(a.nextDue) - +new Date(b.nextDue));
  }, [transactions, categories]);

  const items = [...detected, ...manual];
  const totalMonthly = items
    .filter((i) => !paused.has(i.id))
    .reduce((s, i) => s + (i.frequency === "Monthly" ? i.amount : i.amount * 4.33), 0);

  function addManual() {
    if (!name || Number(amount) <= 0) return;
    setManual((m) => [
      ...m,
      {
        id: `man-${Date.now()}`,
        name,
        categoryKey: cat,
        amount: Number(amount),
        nextDue: due ? new Date(due).toISOString() : new Date().toISOString(),
        frequency: "Monthly",
        manual: true,
      },
    ]);
    setName("");
    setAmount("");
    setDue("");
    setShowAdd(false);
  }

  function remove(id: string) {
    setManual((m) => m.filter((i) => i.id !== id));
  }

  return (
    <AppShell>
      {/* Title block */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="kicker text-primary font-semibold">Subscriptions &amp; Bills</div>
          <h1 className="display text-3xl text-ink font-bold">Upcoming bills</h1>
          <p className="text-muted text-sm mt-1">Review scheduled payments, ongoing subscriptions, and repeat spending.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd((v) => !v)} className="h-10 text-xs">
          <Plus size={15} /> Add Manual Bill
        </Button>
      </div>

      {/* Aggregate Overview card */}
      <div className="card mb-6 flex flex-col sm:flex-row items-center justify-between p-5 bg-surface gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Clock size={22} strokeWidth={2.3} />
          </span>
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Active Monthly Bill Commitments</div>
            <div className="display tabnum text-2xl text-ink font-bold mt-0.5">{formatMoney(totalMonthly, user.currency)}</div>
          </div>
        </div>
        <span className="text-xs text-muted max-w-[280px] text-center sm:text-right font-medium">
          Subscriptions are auto-detected based on ledger repeat activities.
        </span>
      </div>

      {/* Subscriptions alert / insights */}
      <div className="card p-5 bg-primary/5 border border-primary/15 mb-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Sparkles size={18} />
          </span>
          <div>
            <h3 className="font-bold text-ink text-sm">Subscription Optimization</h3>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Based on historical data, we detected {detected.length} active recurring schedules. Keep your subscriptions tidy to maintain lean overhead limits.
            </p>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="card mb-6 flex flex-wrap items-end gap-4 p-5 bg-surface">
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-xs font-bold uppercase text-ink">Bill Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary" placeholder="e.g. Netflix Subscription" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="mb-1 block text-xs font-bold uppercase text-ink">Monthly Cost</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm tabnum text-ink outline-none" placeholder="e.g. 500" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="mb-1 block text-xs font-bold uppercase text-ink">Category</label>
            <select value={cat} onChange={(e) => setCat(e.target.value as CategoryKey)} className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none">
              {categories.map((c) => (
                <option key={c.id} value={c.key}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-bold uppercase text-ink">Next Due Date</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none" />
          </div>
          <Button onClick={addManual} className="h-11">Register Bill</Button>
        </div>
      )}

      {/* Grid List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.length === 0 && (
          <div className="sm:col-span-2">
            <EmptyState icon={RefreshCw} title="No bills scheduled" description="MoneyTrail automatically detects duplicate subscriptions from your ledger, or you can register manual schedules." />
          </div>
        )}
        {items.map((i) => {
          const isPaused = paused.has(i.id);
          return (
            <div key={i.id} className={cn("card flex items-center gap-4 p-5 bg-surface hover:border-primary/40", isPaused && "opacity-60 bg-slate-50/50")}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Calendar size={20} strokeWidth={2.3} />
              </span>
              
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-sm text-ink">{i.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted mt-1">
                  <CategoryBadge categoryKey={i.categoryKey} />
                  <span>· {i.frequency}</span>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <div className="tabnum font-bold text-sm text-ink">{formatMoney(i.amount, user.currency)}</div>
                <div className="text-[11px] text-muted mt-0.5">due {formatDay(i.nextDue)}</div>
              </div>
              
              <div className="flex items-center gap-1 border-l border-line pl-3 shrink-0">
                <button
                  onClick={() => setPaused((s) => { const n = new Set(s); n.has(i.id) ? n.delete(i.id) : n.add(i.id); return n; })}
                  className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink transition-colors"
                  aria-label={isPaused ? "Resume schedule" : "Pause schedule"}
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                </button>
                {i.manual && (
                  <button onClick={() => remove(i.id)} className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger transition-colors" aria-label="Remove subscription">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}


