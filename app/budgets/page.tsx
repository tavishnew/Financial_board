"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Sparkles, Check, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { budgetProgress } from "@/lib/selectors";
import { formatMoney, pct } from "@/lib/format";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/cn";

export default function BudgetsPage() {
  const { transactions, budgets, categories, user, upsertBudget, deleteBudget } = useStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newLimit, setNewLimit] = useState("");

  const progress = budgetProgress(transactions, budgets, categories);
  const totalLimit = progress.reduce((s, b) => s + b.limit, 0);
  const totalSpent = progress.reduce((s, b) => s + b.spent, 0);
  const unbudgeted = categories.filter((c) => !budgets.some((b) => b.categoryId === c.id));

  const overspendCount = progress.filter((b) => b.over).length;

  // Custom recommendation engine
  const recommendations = useMemo(() => {
    if (progress.length === 0) {
      return "You haven't established budgets yet. Setting monthly guardrails helps you save an average of 18% more.";
    }
    if (overspendCount > 0) {
      return `Alert: You are over budget on ${overspendCount} categories. We recommend pausing discretionary shopping and reviewing subscription bills.`;
    }
    if (totalSpent / (totalLimit || 1) > 0.8) {
      return "Caution: You have utilized over 80% of your total budget. Trim auxiliary expenses for the remainder of the month.";
    }
    return "Outstanding pace! Your spending remains well within safety limits. Keep moving toward your savings goals.";
  }, [progress, overspendCount, totalSpent, totalLimit]);

  function saveEdit(id: string) {
    const val = Number(draft);
    if (val > 0) upsertBudget(id, val);
    setEditId(null);
  }

  function addBudget() {
    const cat = categories.find((c) => c.id === newCat);
    if (!cat || Number(newLimit) <= 0) return;
    upsertBudget(cat.id, Number(newLimit));
    setNewCat("");
    setNewLimit("");
    setShowAdd(false);
  }

  return (
    <AppShell>
      {/* Title block */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="kicker text-primary font-semibold">Guardrails &amp; Limits</div>
          <h1 className="display text-3xl text-ink font-bold">This month&apos;s progress</h1>
          <p className="text-muted text-sm mt-1">Configure category limits to safeguard your net savings targets.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd((v) => !v)} className="h-10 text-xs">
          <Plus size={15} /> Configure Limit
        </Button>
      </div>

      {/* Aggregate Overview summary */}
      <div className="card mb-6 grid gap-4 p-5 bg-white sm:grid-cols-3">
        <div>
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Total Limit Set</div>
          <div className="display tabnum text-2xl text-ink font-bold mt-1">{formatMoney(totalLimit, user.currency)}</div>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-line sm:pl-5 pt-3 sm:pt-0">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Spent So Far</div>
          <div className="display tabnum text-2xl text-ink font-bold mt-1">{formatMoney(totalSpent, user.currency)}</div>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-line sm:pl-5 pt-3 sm:pt-0">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Remaining Buffer</div>
          <div className={cn("display tabnum text-2xl font-bold mt-1", totalLimit - totalSpent >= 0 ? "text-[#22C55E]" : "text-[#EF4444]")}>
            {formatMoney(totalLimit - totalSpent, user.currency)}
          </div>
        </div>
      </div>

      {/* Recommendations & insights card */}
      <div className="card p-5 bg-[#2563EB]/5 border border-[#2563EB]/15 mb-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] shrink-0">
            <Sparkles size={18} />
          </span>
          <div>
            <h3 className="font-bold text-ink text-sm">Budget Insights &amp; Recommendations</h3>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">{recommendations}</p>
          </div>
        </div>
      </div>

      {/* Add form */}
      {showAdd && unbudgeted.length > 0 && (
        <div className="card mb-6 flex flex-wrap items-end gap-4 p-5 bg-white">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-xs font-bold uppercase text-ink">Category</label>
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none"
            >
              <option value="">Choose Category…</option>
              {unbudgeted.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-bold uppercase text-ink">Monthly Limit</label>
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm tabnum text-ink outline-none"
              placeholder="e.g. 5000"
            />
          </div>
          <Button onClick={addBudget} className="h-11">Add Budget</Button>
        </div>
      )}

      {/* List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {progress.length === 0 && (
          <div className="sm:col-span-2">
            <EmptyState
              icon={Plus}
              title="No active budgets"
              description="Configure limits for any category to track monthly spending limits instantly."
            />
          </div>
        )}
        {progress.map((b) => {
          const meta = b.category ? CATEGORY_META[b.category.key] : null;
          const Icon = meta?.icon ?? Plus;
          return (
            <div key={b.budget.id} className="card p-5 bg-white hover:border-[#2563EB]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{ background: `color-mix(in oklch, ${meta?.hue ?? "var(--primary)"} 15%, transparent)`, color: meta?.hue ?? "var(--primary)" }}
                  >
                    <Icon size={18} strokeWidth={2.4} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-ink truncate">{b.category?.name}</div>
                    <div className="text-xs text-muted font-semibold">{b.over ? "Over limit" : `${pct(b.spent, b.limit)}% utilized`}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {editId === b.budget.id ? (
                      <div className="flex items-center gap-1 rounded-xl bg-surface-2 px-2.5 py-1">
                        <span className="text-xs text-muted">{user.currency === "INR" ? "₹" : "$"}</span>
                        <input
                          autoFocus
                          type="number"
                          defaultValue={b.limit}
                          onChange={(e) => setDraft(e.target.value)}
                          onBlur={() => saveEdit(b.budget.id)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(b.budget.id)}
                          className="h-7 w-20 bg-transparent text-right font-bold tabnum text-ink outline-none text-sm"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditId(b.budget.id);
                          setDraft(String(b.limit));
                        }}
                        className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink transition-colors"
                        aria-label="Edit budget"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteBudget(b.budget.id)}
                      className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                      aria-label="Delete budget"
                    >
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-5">
                  <ProgressBar value={b.pct} hue={meta?.hue ?? "var(--primary)"} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                <span className="tabnum text-muted font-bold">{formatMoney(b.spent, user.currency)} spent</span>
                <span className={cn("tabnum font-semibold", b.over ? "text-danger" : "text-ink")}>
                  {b.over ? `+${formatMoney(Math.abs(b.remaining), user.currency)} over` : `${formatMoney(b.remaining, user.currency)} remaining`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

