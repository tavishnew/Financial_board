"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TransactionModal } from "./TransactionModal";
import clsx from "clsx";

export function QuickAdd({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={clsx(
          "inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-colors transition-transform hover:-translate-y-0.5 hover:bg-primary-press active:scale-[0.98]",
          className
        )}
      >
        <Plus size={18} strokeWidth={2.6} /> Add
      </button>
      <TransactionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

