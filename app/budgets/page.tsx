"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kicker">Guardrails</div>
          <h1 className="display text-3xl text-ink">Budgets</h1>
        </div>
        <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
          <Plus size={16} /> Add budget
        </Button>
      </div>

      {/* Summary */}
      <div className="card mb-4 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="text-sm text-muted">Total spent this month</div>
          <div className="display tabnum text-2xl text-ink">{formatMoney(totalSpent, user.currency)}</div>
        </div>
        <div className="hidden h-10 w-px bg-line sm:block" />
        <div>
          <div className="text-sm text-muted">Total budget</div>
          <div className="display tabnum text-2xl text-ink">{formatMoney(totalLimit, user.currency)}</div>
        </div>
        <div className="hidden h-10 w-px bg-line sm:block" />
        <div>
          <div className="text-sm text-muted">Remaining</div>
          <div className={cn("display tabnum text-2xl", totalLimit - totalSpent >= 0 ? "text-[color:var(--c-income)]" : "text-[color:var(--c-bills)]")}>
            {formatMoney(totalLimit - totalSpent, user.currency)}
          </div>
        </div>
      </div>

      {/* Add form */}
      {showAdd && unbudgeted.length > 0 && (
        <div className="card mb-4 flex flex-wrap items-end gap-3 p-4">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Category</label>
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none"
            >
              <option value="">Choose…</option>
              {unbudgeted.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Monthly limit</label>
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm tabnum text-ink outline-none"
            />
          </div>
          <Button onClick={addBudget}>Add</Button>
        </div>
      )}

      {/* List */}
      <div className="grid gap-3 sm:grid-cols-2">
        {progress.length === 0 && (
          <div className="sm:col-span-2">
            <EmptyState
              icon={Plus}
              title="No budgets yet"
              description="Add a monthly limit for a category to start tracking your spend."
            />
          </div>
        )}
        {progress.map((b) => {
          const meta = b.category ? CATEGORY_META[b.category.key] : null;
          const Icon = meta?.icon ?? Plus;
          return (
            <div key={b.budget.id} className="card p-5">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl"
                  style={{ background: `color-mix(in oklch, ${meta?.hue ?? "var(--primary)"} 18%, transparent)`, color: meta?.hue ?? "var(--primary)" }}
                >
                  <Icon size={20} strokeWidth={2.4} />
                </span>
                <div className="flex-1">
                  <div className="font-bold text-ink">{b.category?.name}</div>
                  <div className="text-xs text-muted">{b.over ? "Over budget" : `${pct(b.spent, b.limit)}% used`}</div>
                </div>
                <div className="flex items-center gap-2">
                  {editId === b.budget.id ? (
                    <div className="flex items-center gap-1 rounded-xl bg-surface-2 px-2">
                      <span className="text-xs text-muted">{user.currency === "INR" ? "₹" : "$"}</span>
                      <input
                        autoFocus
                        type="number"
                        defaultValue={b.limit}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => saveEdit(b.budget.id)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(b.budget.id)}
                        className="h-9 w-24 bg-transparent text-right font-bold tabnum text-ink outline-none"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditId(b.budget.id);
                        setDraft(String(b.limit));
                      }}
                      className="rounded-xl p-2 text-muted hover:bg-surface-2 hover:text-ink"
                      aria-label="Edit limit"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteBudget(b.budget.id)}
                    className="rounded-xl p-2 text-muted hover:bg-[color:var(--c-bills)]/10 hover:text-[color:var(--c-bills)]"
                    aria-label="Remove budget"
                  >
                    <Plus size={15} className="rotate-45" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar value={b.pct} hue={meta?.hue ?? "var(--primary)"} />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="tabnum text-muted">{formatMoney(b.spent, user.currency)} spent</span>
                <span className={cn("tabnum font-semibold", b.over ? "text-[color:var(--c-bills)]" : "text-ink")}>
                  {b.over ? `+${formatMoney(Math.abs(b.remaining), user.currency)}` : `${formatMoney(b.remaining, user.currency)} left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
