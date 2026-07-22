"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Wallet } from "lucide-react";
import { CATEGORY_META } from "@/lib/categories";
import { useStore } from "@/lib/store";
import { useToast } from "./Toast";
import { Button } from "./Button";
import { cn } from "@/lib/cn";
import type { CategoryKey, TxnType } from "@/lib/types";

// ──────────────────────────────────────────────
// Tailwind class groups (extracted from 3+ repeats)
// ──────────────────────────────────────────────
const cardShell = "card w-full max-w-md p-6";
const fieldWrapper = "mb-4";
const labelStyle = "mb-1 block text-sm font-semibold text-ink";
const inputBase = "rounded-2xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none";
const selectBase = "h-11 w-full " + inputBase;
const dateInputBase = selectBase;
const toggleBtn = "rounded-xl py-2 text-sm font-semibold capitalize transition-colors";
const categoryBtn = "flex flex-col items-center gap-1 rounded-2xl border p-2 text-xs font-semibold transition-colors";

export function TransactionModal({
  open,
  onClose,
  defaultType = "expense",
}: {
  open: boolean;
  onClose: () => void;
  defaultType?: TxnType;
}) {
  const { categories, accounts, addTransaction, user } = useStore();
  const toast = useToast();
  const reduce = useReducedMotion();

  const [type, setType] = useState<TxnType>(defaultType);
  const [amount, setAmount] = useState("");
  const [categoryKey, setCategoryKey] = useState<CategoryKey | null>(null);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setAmount("");
      setCategoryKey(null);
      setAccountId(accounts[0]?.id ?? "");
      setDate(new Date().toISOString().slice(0, 10));
      setNote("");
    }
  }, [open, defaultType]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const valid = Number(amount) > 0 && accountId;

  function submit() {
    if (!valid) {
      toast("Enter an amount greater than zero", "error");
      return;
    }
    const cat = categories.find((c) => c.key === categoryKey);
    addTransaction({
      type,
      amount: Number(amount),
      categoryId: type === "income" ? null : cat?.id ?? null,
      accountId,
      date: new Date(date).toISOString(),
      note: note.trim() || undefined,
    });
    toast(type === "income" ? "Income added" : "Expense added", "success");
    onClose();
  }

  // ──────────────────────────────────────────────
  // Sub-components (semantic names, extracted from inline)
  // ──────────────────────────────────────────────
  
  // TypeSelector: expense/income toggle
  const TypeSelector = () => (
    <div className={`${fieldWrapper} grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1`} data-testid="type-selector">
      {(["expense", "income"] as TxnType[]).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setType(t)}
          className={cn(
            toggleBtn,
            type === t ? "bg-primary text-white" : "text-muted hover:text-ink"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );

  // AmountField: currency-prefixed number input
  const AmountField = () => (
    <div className={`${fieldWrapper} flex items-center gap-2 rounded-2xl border border-line bg-surface-2 px-4`} data-testid="amount-field">
      <span className="text-lg font-bold text-muted">{user.currency === "INR" ? "₹" : "$"}</span>
      <input
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        className="h-12 w-full bg-transparent text-lg font-bold tabnum text-ink outline-none placeholder:text-muted/50"
        autoFocus
        aria-label="Amount"
      />
    </div>
  );

  // CategoryGrid: 3-column category picker (expenses only)
  const CategoryGrid = () => (
    <div className={`${fieldWrapper} grid grid-cols-3 gap-2`} data-testid="category-grid">
      {categories.map((c) => {
        const meta = CATEGORY_META[c.key];
        const Icon = meta.icon;
        const active = categoryKey === c.key;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoryKey(c.key)}
            className={cn(
              categoryBtn,
              active ? "border-primary" : "border-line hover:border-primary/50"
            )}
            style={active ? { background: "color-mix(in oklch, 14%, transparent)", color: meta.hue } : undefined}
            aria-pressed={active}
            aria-label={meta.name}
          >
            <Icon size={18} strokeWidth={2.4} aria-hidden="true" />
            {meta.name}
          </button>
        );
      })}
    </div>
  );

  // AccountDateFields: side-by-side account select + date picker
  const AccountDateFields = () => (
    <div className={`${fieldWrapper} grid grid-cols-2 gap-3`} data-testid="account-date-fields">
      <div>
        <label htmlFor="txn-account" className={labelStyle}>Account</label>
        <select
          id="txn-account"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className={selectBase}
        >
          {accounts.filter((a) => !a.archived).map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="txn-date" className={labelStyle}>Date</label>
        <input
          id="txn-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={dateInputBase}
        />
      </div>
    </div>
  );

  // NoteField: free-text note input
  const NoteField = () => (
    <div className={`${fieldWrapper}`} data-testid="note-field">
      <label htmlFor="txn-note" className={labelStyle}>Note</label>
      <input
        id="txn-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Grocery run"
        className={`h-11 w-full ${inputBase}`}
      />
    </div>
  );

  // ActionButtons: cancel + submit
  const ActionButtons = () => (
    <div className="flex gap-3" data-testid="action-buttons">
      <Button variant="soft" className="flex-1" onClick={onClose}>
        Cancel
      </Button>
      <Button className="flex-1" onClick={submit} disabled={!valid}>
        <Wallet size={16} aria-hidden="true" /> Add {type}
      </Button>
    </div>
  );

  // ──────────────────────────────────────────────
  // Render via portal
  // ──────────────────────────────────────────────
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-testid="transaction-modal-backdrop"
          role="presentation"
          aria-hidden="true"
        >
          <motion.div
            className={cardShell}
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(20px) scale(0.97)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px) scale(1)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(20px) scale(0.97)", transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
            transition={reduce ? { duration: 0.18 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Add transaction"
            data-testid="transaction-modal"
          >
            <header className="mb-5 flex items-center justify-between" data-testid="modal-header">
              <h2 className="display text-xl text-ink">Add transaction</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-muted hover:text-ink"
                aria-label="Close"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={(e) => { e.preventDefault(); submit(); }} data-testid="transaction-form">
              <TypeSelector />
              <AmountField />
              {type === "expense" && <CategoryGrid />}
              <AccountDateFields />
              <NoteField />
              <ActionButtons />
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}