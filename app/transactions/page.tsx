"use client";

import { useMemo, useRef, useState } from "react";
import { Search, Download, Upload, Trash2, X, Check, Calendar, ArrowRightLeft, TrendingDown, ArrowUpRight, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TransactionRow } from "@/components/TransactionRow";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { CATEGORY_META } from "@/lib/categories";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TxnType } from "@/lib/types";

const PAGE = 12;

export default function TransactionsPage() {
  const { transactions, categories, accounts, deleteTransaction, addTransaction, user } = useStore();
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  // Monthly summary metrics for filtered set
  const monthlySummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    filtered.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === "income") {
        totalIncome += amt;
      } else {
        totalExpense += amt;
      }
    });
    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
    };
  }, [filtered]);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
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
    a.download = "MoneyTrail-ledger.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${filtered.length} transactions successfully`, "success");
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
      toast(`Imported ${count} transactions into workspace`, "success");
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(file);
  }

  function deleteSelected() {
    selected.forEach((id) => deleteTransaction(id));
    toast(`Successfully deleted ${selected.size} transactions`, "success");
    setSelected(new Set());
    setConfirmBulk(false);
  }

  return (
    <AppShell>
      {/* Title block */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="kicker text-primary font-semibold">Ledger &amp; Bookkeeping</div>
          <h1 className="display text-3xl text-ink font-bold">Where your money is going</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="h-10 text-xs">
            <Upload size={14} /> Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} className="h-10 text-xs">
            <Download size={14} /> Export CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCsv} />
        </div>
      </div>

      {/* Monthly summary analytics cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="card p-5 bg-white flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight size={14} className="text-[#22C55E]" /> Total Received
            </div>
            <div className="display tabnum text-xl mt-1 text-[#22C55E] font-bold">
              {formatMoney(monthlySummary.income, user.currency)}
            </div>
          </div>
          <span className="text-[10px] bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 rounded font-bold uppercase">Filtered</span>
        </div>
        
        <div className="card p-5 bg-white flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
              <TrendingDown size={14} className="text-[#EF4444]" /> Total Spent
            </div>
            <div className="display tabnum text-xl mt-1 text-[#EF4444] font-bold">
              {formatMoney(monthlySummary.expense, user.currency)}
            </div>
          </div>
          <span className="text-[10px] bg-[#EF4444]/10 text-[#EF4444] px-2 py-0.5 rounded font-bold uppercase">Filtered</span>
        </div>

        <div className="card p-5 bg-white flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
              <ArrowRightLeft size={14} className="text-primary" /> Net Cash Flow
            </div>
            <div className={cn("display tabnum text-xl mt-1 font-bold", monthlySummary.net >= 0 ? "text-primary" : "text-danger")}>
              {formatMoney(monthlySummary.net, user.currency)}
            </div>
          </div>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">Filtered</span>
        </div>
      </div>

      {/* Modern filters workspace toolbar */}
      <div className="card p-4 bg-white mb-6 space-y-3">
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 border border-line px-3 py-1">
          <Search size={16} className="text-muted shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search merchants, categories, or accounts..."
            className="h-9 w-full bg-transparent text-sm text-ink outline-none"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex bg-surface-2 p-0.5 rounded-pill border border-line">
            {(["all", "expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-pill px-3 py-1 text-xs font-bold capitalize transition-colors",
                  type === t ? "bg-primary text-white" : "text-muted hover:text-ink"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <span className="h-5 w-px bg-line" />

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-8 rounded-pill border border-line bg-surface-2 px-3 text-xs font-semibold text-ink outline-none"
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
            className="h-8 rounded-pill border border-line bg-surface-2 px-3 text-xs font-semibold text-ink outline-none"
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

      {/* Bulk actions panel */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#0E7C5B]/25 bg-[#0E7C5B]/5 px-4 py-3 shadow-sm animate-pulse">
          <span className="text-xs font-bold text-ink">{selected.size} items selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelected(new Set())} className="h-8 text-xs font-bold">
              Clear Choice
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmBulk(true)} className="h-8 text-xs font-bold">
              <Trash2 size={13} /> Bulk Delete
            </Button>
          </div>
        </div>
      )}

      {/* Transactions list container */}
      <div className="card overflow-hidden bg-white shadow-sm border border-line">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            {/* Sticky Table Headers */}
            <thead className="bg-[#FBF7F0] border-b border-line text-xs font-bold uppercase text-muted tracking-wider sticky top-0 z-10">
              <tr>
                <th className="w-12 py-3.5 pl-4 text-center">
                  <button
                    onClick={toggleSelectAll}
                    aria-label="Select all matching"
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-md border mx-auto transition-colors",
                      allSelected ? "border-primary bg-primary text-white" : "border-line"
                    )}
                  >
                    {allSelected && <Check size={13} />}
                  </button>
                </th>
                <th className="py-3.5 pl-2 text-left w-[40%]">Merchant &amp; Details</th>
                <th className="py-3.5 text-left hidden sm:table-cell w-[25%]">Account</th>
                <th className="py-3.5 text-right w-[20%]">Amount</th>
                <th className="py-3.5 pr-4 text-center w-16">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={Search}
                      title="No matching records found"
                      description="Clear your filter criteria or register a new transaction to populate the ledger."
                    />
                  </td>
                </tr>
              ) : (
                shown.map((t) => {
                  const isExpanded = expandedId === t.id;
                  const cat = t.categoryId ? catMap[t.categoryId] : null;
                  const meta = cat ? CATEGORY_META[cat.key] : null;
                  const Icon = meta?.icon ?? HelpCircle;
                  return (
                    <tr key={t.id} className={cn("hover:bg-slate-50/50 transition-colors", isExpanded && "bg-slate-50")}>
                      {/* Checkbox */}
                      <td className="py-4 text-center border-b border-line pl-4">
                        <button
                          onClick={() => toggle(t.id)}
                          aria-label="Select row"
                          className={cn(
                            "grid h-5 w-5 place-items-center rounded-md border mx-auto transition-colors",
                            selected.has(t.id) ? "border-primary bg-primary text-white" : "border-line"
                          )}
                        >
                          {selected.has(t.id) && <Check size={13} />}
                        </button>
                      </td>

                      {/* Details & Merchant */}
                      <td className="py-4 border-b border-line pl-2 align-middle cursor-pointer" onClick={() => toggleExpand(t.id)}>
                        <div className="flex items-center gap-3">
                          {/* Beautiful Merchant / Category Icon */}
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl font-bold text-sm"
                            style={{
                              background: meta ? `color-mix(in oklch, ${meta.hue} 15%, transparent)` : `rgba(37,99,235,0.1)`,
                              color: meta?.hue ?? "var(--primary)"
                            }}
                          >
                            <Icon size={16} strokeWidth={2.4} />
                          </span>
                          
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-ink truncate leading-tight">
                              {t.note || "Uncategorized Merchant"}
                            </div>
                            <div className="text-xs text-muted mt-1 flex flex-wrap items-center gap-2">
                              <span>{formatDate(t.date)}</span>
                              <span className="h-3 w-px bg-line" />
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                                style={{
                                  background: meta ? `color-mix(in oklch, ${meta.hue} 12%, transparent)` : `rgba(0,0,0,0.06)`,
                                  color: meta?.hue ?? "var(--muted)"
                                }}
                              >
                                {cat?.name || "Income"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Account */}
                      <td className="py-4 border-b border-line hidden sm:table-cell align-middle text-sm font-semibold text-muted">
                        {accMap[t.accountId]?.name || "Cash Vault"}
                      </td>

                      {/* Amount */}
                      <td className="py-4 border-b border-line text-right align-middle font-bold text-sm">
                        <span className={t.type === "income" ? "text-[#22C55E]" : "text-[#EF4444]"}>
                          {t.type === "income" ? "+" : "-"} {formatMoney(t.amount, user.currency)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 border-b border-line text-center pr-4 align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => toggleExpand(t.id)}
                            className="p-1.5 rounded-lg text-muted hover:bg-surface-2 transition-colors"
                            aria-label="Expand details"
                          >
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                          <button
                            onClick={() => setConfirmId(t.id)}
                            aria-label="Delete transaction"
                            className="p-1.5 rounded-lg text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {visible < filtered.length && (
        <div className="mt-6 flex justify-center pb-8">
          <Button variant="soft" onClick={() => setVisible((v) => v + PAGE)} className="text-xs px-5 h-10 font-bold">
            Load More Transactions ({filtered.length - visible} remaining)
          </Button>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmDialog
        open={!!confirmId}
        title="Delete transaction ledger entry?"
        message="This operation will permanently delete the transaction record and adjust the target account's balance."
        onConfirm={() => {
          if (confirmId) deleteTransaction(confirmId);
          setConfirmId(null);
          toast("Ledger entry removed", "success");
        }}
        onCancel={() => setConfirmId(null)}
      />
      <ConfirmDialog
        open={confirmBulk}
        title={`Delete ${selected.size} transactions?`}
        message="Are you certain you want to remove the selected ledger items? This will permanently revert all corresponding account balances."
        onConfirm={deleteSelected}
        onCancel={() => setConfirmBulk(false)}
      />
    </AppShell>
  );
}


