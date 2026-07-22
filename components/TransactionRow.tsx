"use client";

import { Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORY_META } from "@/lib/categories";
import { formatMoney, relativeDay } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import clsx from "clsx";
import { DEMO_CATEGORIES } from "@/lib/demo";
import { useMemo } from "react";

export function TransactionRow({ txn }: { txn: Transaction }) {
  const { categories, accounts, user, transactions } = useStore();
  const cat = txn.categoryId
    ? categories.find((c) => c.id === txn.categoryId) ?? DEMO_CATEGORIES.find((c) => c.id === txn.categoryId)
    : null;
  const meta = cat ? CATEGORY_META[cat.key] : null;
  const Icon = meta?.icon ?? Wallet;
  const hue = meta?.hue ?? "var(--c-income)";
  const account = accounts.find((a) => a.id === txn.accountId);
  const isIncome = txn.type === "income";

  // Calculate total income from all transactions
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Check if transaction exceeds limits
  const isOverLimit = isIncome
    ? account && txn.amount > account.balance
    : txn.amount > totalIncome || (account && txn.amount > account.balance);

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
        style={{ background: `color-mix(in oklch, ${hue} 16%, transparent)`, color: hue }}
      >
        <Icon size={18} strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink">{txn.note || "Transaction"}</div>
        <div className="truncate text-xs text-muted">
          {isIncome ? "Income" : cat ? meta?.name : "Uncategorized"}
          {account ? ` · ${account.name}` : ""} · {relativeDay(txn.date)}
        </div>
      </div>
      <div
        className={clsx(
          "tabnum shrink-0 text-sm font-bold",
          isIncome ? (isOverLimit ? "text-[#DC2626]" : "text-primary") : isOverLimit ? "text-[#DC2626]" : "text-ink"
        )}
      >
        {formatMoney(isIncome ? txn.amount : -txn.amount, user.currency, { signed: true })}
      </div>
    </div>
  );
}

