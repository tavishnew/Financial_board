"use client";

import { useState } from "react";
import { Plus, Target, Trash2, CalendarClock, Trophy, Sparkles, Milestone, CheckCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useStore } from "@/lib/store";
import { formatMoney, pct, formatDate } from "@/lib/format";
import clsx from "clsx";

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
      {/* Title block */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="kicker text-primary font-semibold">Targets &amp; Ambitions</div>
          <h1 className="display text-3xl text-ink font-bold">Keep moving toward your goals</h1>
          <p className="text-muted text-sm mt-1">Set targets for future milestones and monitor progress trends.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd((v) => !v)} className="h-10 text-xs">
          <Plus size={15} /> Establish Goal
        </Button>
      </div>

      {/* Goal insights & recommendations card */}
      <div className="card p-5 bg-primary/5 border border-primary/15 mb-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Trophy size={18} />
          </span>
          <div>
            <h3 className="font-bold text-ink text-sm">Goal Milestones &amp; Achievements</h3>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              {goals.length === 0 
                ? "Setting savings goals is the first step to financial security. Watch your ambitions come to life."
                : "Tip: Aligning your goals with automatic recurring transfers is proven to increase achievement rates by 40%."}
            </p>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="card mb-6 flex flex-wrap items-end gap-4 p-5 bg-surface">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-xs font-bold uppercase text-ink">Goal name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Europe Vacation"
              className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1 block text-xs font-bold uppercase text-ink">Target Amount</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm tabnum text-ink outline-none"
              placeholder="e.g. 10000"
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1 block text-xs font-bold uppercase text-ink">Saved So Far</label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm tabnum text-ink outline-none"
              placeholder="e.g. 1500"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-xs font-bold uppercase text-ink">Target Date</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none"
            />
          </div>
          <Button onClick={add} className="h-11">Establish</Button>
        </div>
      )}

      {/* Grid List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              icon={Target}
              title="No active saving targets"
              description="Define your first savings milestone, and we will help you track your progress timeline."
              action={
                <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
                  <Plus size={16} /> Add goal
                </Button>
              }
            />
          </div>
        )}
        {goals.map((g) => {
          const p = pct(g.currentAmount, g.targetAmount);
          const isFinished = p >= 100;
          
          // Calculate milestones
          const milestoneText = p >= 100 
            ? "Goal completed!" 
            : p >= 75 
            ? "Final stretch!" 
            : p >= 50 
            ? "Halfway mark!" 
            : p >= 25 
            ? "Milestone: 25% completed" 
            : "Milestone: Just started";

          return (
            <div key={g.id} className="card p-5 bg-surface hover:border-primary/40 flex flex-col justify-between min-h-[250px]">
              <div>
                <div className="flex items-start justify-between">
                  <span className={clsx(
                    "grid h-11 w-11 place-items-center rounded-2xl",
                    isFinished 
                      ? "bg-[#22C55E]/15 text-primary" 
                      : "bg-[#14B8A6]/15 text-[#14B8A6]"
                  )}>
                    {isFinished ? <CheckCircle size={22} strokeWidth={2.3} /> : <Target size={22} strokeWidth={2.3} />}
                  </span>
                  
                  <button
                    onClick={() => setConfirmId(g.id)}
                    className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                    aria-label="Delete goal"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="text-base font-bold text-ink leading-tight">{g.name}</div>
                  <div className="mt-2.5 flex items-baseline justify-between text-xs">
                    <span className="tabnum font-bold text-ink text-sm">{formatMoney(g.currentAmount, user.currency)}</span>
                    <span className="tabnum text-muted">target of {formatMoney(g.targetAmount, user.currency)}</span>
                  </div>
                  
                  <ProgressBar value={p} hue="var(--c-savings)" className="mt-3" />
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-line">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span className="flex items-center gap-1 font-bold text-[#14B8A6]">
                    <Milestone size={12} /> {milestoneText}
                  </span>
                  {g.deadline && (
                    <span className="flex items-center gap-1 font-semibold">
                      <CalendarClock size={12} /> by {formatDate(g.deadline)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Remove savings target?"
        message="This savings target will be removed. Your money balances will remain completely unaffected."
        onConfirm={() => {
          if (confirmId) deleteGoal(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </AppShell>
  );
}

