"use client";

import { useMemo, useRef, useState } from "react";
import { Search, Download, Upload, Trash2, X, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TransactionRow } from "@/components/TransactionRow";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { CATEGORY_META } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TxnType } from "@/lib/types";

const PAGE = 12;

export default function TransactionsPage() {
  const { transactions, categories, accounts, deleteTransaction, addTransaction } = useStore();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [type, setType] = useState<TxnType | "all">("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [accFilter, setAccFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [visible, setVisible] = useState(PAGE);

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );
  const accMap = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a])),
    [accounts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (type !== "all" && t.type !== type) return false;
        if (catFilter !== "all" && t.categoryId !== catFilter) return false;
        if (accFilter !== "all" && t.accountId !== accFilter) return false;
        if (q) {
          const catName = t.categoryId ? catMap[t.categoryId]?.name.toLowerCase() : "income";
          const accName = accMap[t.accountId]?.name.toLowerCase() ?? "";
          if (
            !t.note?.toLowerCase().includes(q) &&
            !catName.includes(q) &&
            !accName.includes(q)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [transactions, type, catFilter, accFilter, query, catMap, accMap]);

  const shown = filtered.slice(0, visible);
  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exportCsv() {
    const header = "date,type,amount,category,account,note";
    const rows = filtered.map((t) => {
      const cat = t.categoryId ? catMap[t.categoryId]?.name ?? "" : "Income";
      const acc = accMap[t.accountId]?.name ?? "";
      return [
        t.date.slice(0, 10),
        t.type,
        t.amount,
        `"${cat}"`,
        `"${acc}"`,
        `"${t.note ?? ""}"`,
      ].join(",");
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finboard-transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${filtered.length} transactions`, "success");
  }

  function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.split("\n").filter(Boolean).slice(1);
      let count = 0;
      for (const line of lines) {
        const [date, ttype, amount, category, account, note] = line.split(",");
        const cat = categories.find((c) => c.name.toLowerCase() === (category ?? "").replace(/"/g, "").toLowerCase());
        const acc = accounts.find((a) => a.name.toLowerCase() === (account ?? "").replace(/"/g, "").toLowerCase());
        if (!acc) continue;
        addTransaction({
          type: ttype === "income" ? "income" : "expense",
          amount: Number(amount) || 0,
          categoryId: cat?.id ?? null,
          accountId: acc.id,
          date: new Date(date).toISOString(),
          note: note?.replace(/"/g, ""),
        });
        count++;
      }
      toast(`Imported ${count} transactions`, "success");
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(file);
  }

  function deleteSelected() {
    selected.forEach((id) => deleteTransaction(id));
    toast(`Deleted ${selected.size} transactions`, "success");
    setSelected(new Set());
    setConfirmBulk(false);
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kicker">Money in motion</div>
          <h1 className="display text-3xl text-ink">Transactions</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Import
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download size={16} /> Export
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCsv} />
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface-2 px-4">
          <Search size={18} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, categories, accounts…"
            className="h-11 w-full bg-transparent text-ink outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-sm font-semibold capitalize transition-colors",
                type === t ? "bg-primary text-on-primary" : "bg-surface-2 text-muted hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-line" />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-9 rounded-pill border border-line bg-surface-2 px-3 text-sm text-ink outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={accFilter}
            onChange={(e) => setAccFilter(e.target.value)}
            className="h-9 rounded-pill border border-line bg-surface-2 px-3 text-sm text-ink outline-none"
          >
            <option value="all">All accounts</option>
            {accounts.filter((a) => !a.archived).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/10 px-4 py-2.5">
          <span className="text-sm font-semibold text-ink">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button variant="soft" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmBulk(true)}>
              <Trash2 size={15} /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card divide-y divide-line p-3 sm:p-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No transactions match"
            description="Try clearing filters or add a new transaction to get started."
          />
        ) : (
          shown.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-0.5">
              <button
                onClick={() => toggle(t.id)}
                aria-label="Select transaction"
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                  selected.has(t.id) ? "border-primary bg-primary text-on-primary" : "border-line"
                )}
              >
                {selected.has(t.id) && <Check size={13} />}
              </button>
              <div className="min-w-0 flex-1">
                <TransactionRow txn={t} />
              </div>
              <button
                onClick={() => setConfirmId(t.id)}
                aria-label="Delete transaction"
                className="shrink-0 rounded-xl p-2 text-muted hover:bg-[color:var(--c-bills)]/10 hover:text-[color:var(--c-bills)]"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {visible < filtered.length && (
        <div className="mt-4 flex justify-center">
          <Button variant="soft" onClick={() => setVisible((v) => v + PAGE)}>
            Load more ({filtered.length - visible})
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Delete transaction?"
        message="This will remove the transaction and revert its effect on the account balance."
        onConfirm={() => {
          if (confirmId) deleteTransaction(confirmId);
          setConfirmId(null);
          toast("Transaction deleted", "success");
        }}
        onCancel={() => setConfirmId(null)}
      />
      <ConfirmDialog
        open={confirmBulk}
        title={`Delete ${selected.size} transactions?`}
        message="This cannot be undone and will adjust account balances."
        onConfirm={deleteSelected}
        onCancel={() => setConfirmBulk(false)}
      />
    </AppShell>
  );
}
