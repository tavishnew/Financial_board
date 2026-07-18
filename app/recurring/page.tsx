"use client";

import { useMemo, useState } from "react";
import { Plus, Pause, Play, RefreshCw, Trash2 } from "lucide-react";
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
      const g = groups.get(key) ?? { note: t.note ?? "Recurring", catId: t.categoryId, dates: [], amounts: [] };
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
      const cat = categories.find((c) => c.id === g.catId);
      if (!cat) continue;
      const avg = g.amounts.reduce((s, a) => s + a, 0) / g.amounts.length;
      out.push({
        id: `det-${key}`,
        name: g.note,
        categoryKey: cat.key,
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kicker">Subscriptions &amp; bills</div>
          <h1 className="display text-3xl text-ink">Recurring</h1>
        </div>
        <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
          <Plus size={16} /> Add manual
        </Button>
      </div>

      <div className="card mb-4 flex items-center justify-between p-5">
        <div>
          <div className="text-sm text-muted">Active recurring / month</div>
          <div className="display tabnum text-2xl text-ink">{formatMoney(totalMonthly, user.currency)}</div>
        </div>
        <RefreshCw size={28} className="text-primary" />
      </div>

      {showAdd && (
        <div className="card mb-4 flex flex-wrap items-end gap-3 p-4">
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm tabnum text-ink outline-none" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Category</label>
            <select value={cat} onChange={(e) => setCat(e.target.value as CategoryKey)} className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none">
              {categories.map((c) => (
                <option key={c.id} value={c.key}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Next due</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none" />
          </div>
          <Button onClick={addManual}>Add</Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {items.length === 0 && (
          <div className="sm:col-span-2">
            <EmptyState icon={RefreshCw} title="No recurring items" description="We'll detect repeats automatically, or add a subscription manually." />
          </div>
        )}
        {items.map((i) => {
          const isPaused = paused.has(i.id);
          return (
            <div key={i.id} className={cn("card flex items-center gap-3 p-4", isPaused && "opacity-60")}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                <RefreshCw size={20} strokeWidth={2.3} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-ink">{i.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <CategoryBadge categoryKey={i.categoryKey} />
                  <span>· {i.frequency}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="tabnum font-bold text-ink">{formatMoney(i.amount, user.currency)}</div>
                <div className="text-xs text-muted">due {formatDay(i.nextDue)}</div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setPaused((s) => { const n = new Set(s); n.has(i.id) ? n.delete(i.id) : n.add(i.id); return n; })}
                  className="rounded-xl p-2 text-muted hover:bg-surface-2 hover:text-ink"
                  aria-label={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Play size={15} /> : <Pause size={15} />}
                </button>
                {i.manual && (
                  <button onClick={() => remove(i.id)} className="rounded-xl p-2 text-muted hover:bg-[color:var(--c-bills)]/10 hover:text-[color:var(--c-bills)]" aria-label="Remove">
                    <Trash2 size={15} />
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
