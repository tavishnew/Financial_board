"use client";

import { useState } from "react";
import { Plus, Target, Trash2, CalendarClock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useStore } from "@/lib/store";
import { formatMoney, pct, formatDate } from "@/lib/format";

export default function GoalsPage() {
  const { goals, user, addGoal, deleteGoal } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function add() {
    if (!name || Number(target) <= 0) return;
    addGoal({
      name,
      targetAmount: Number(target),
      currentAmount: Number(current) || 0,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
    });
    setName("");
    setTarget("");
    setCurrent("");
    setDeadline("");
    setShowAdd(false);
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kicker">What are you saving for?</div>
          <h1 className="display text-3xl text-ink">Goals</h1>
        </div>
        <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
          <Plus size={16} /> Add goal
        </Button>
      </div>

      {showAdd && (
        <div className="card mb-4 flex flex-wrap items-end gap-3 p-4">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Goal name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Japan Trip"
              className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Target</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm tabnum text-ink outline-none"
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Saved so far</label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm tabnum text-ink outline-none"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-sm font-semibold text-ink">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-11 w-full rounded-2xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none"
            />
          </div>
          <Button onClick={add}>Add</Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="Set a target — a trip, a gadget, an emergency fund — and watch the bar fill."
            />
          </div>
        )}
        {goals.map((g) => {
          const p = pct(g.currentAmount, g.targetAmount);
          return (
            <div key={g.id} className="card p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:var(--c-savings)]/15 text-[color:var(--c-savings)]">
                  <Target size={22} strokeWidth={2.3} />
                </span>
                <button
                  onClick={() => setConfirmId(g.id)}
                  className="rounded-xl p-2 text-muted hover:bg-[color:var(--c-bills)]/10 hover:text-[color:var(--c-bills)]"
                  aria-label="Delete goal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-4 text-lg font-bold text-ink">{g.name}</div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="tabnum text-muted">{formatMoney(g.currentAmount, user.currency)}</span>
                <span className="tabnum font-semibold text-ink">of {formatMoney(g.targetAmount, user.currency)}</span>
              </div>
              <ProgressBar value={p} hue="var(--c-savings)" className="mt-3" />
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span className="font-bold text-[color:var(--c-savings)]">{p}% there</span>
                {g.deadline && (
                  <span className="flex items-center gap-1">
                    <CalendarClock size={12} /> {formatDate(g.deadline)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete goal?"
        message="This goal will be removed. Your money isn't affected."
        onConfirm={() => {
          if (confirmId) deleteGoal(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </AppShell>
  );
}
