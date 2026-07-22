"use client";

import { useState, useMemo } from "react";
import { Calculator, Printer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";
import { monthTotals } from "@/lib/selectors";
import { formatMoney } from "@/lib/format";
import { CATEGORY_META } from "@/lib/categories";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const { transactions, user, categories } = useStore();
  const [activeTab, setActiveTab] = useState<"monthly" | "annual" | "category" | "tax">("monthly");

  const totals = monthTotals(transactions);
  
  // Custom Category Aggregates for report
  const categoryAggregates = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type !== "expense" || !t.categoryId) return;
      map[t.categoryId] = (map[t.categoryId] || 0) + Number(t.amount);
    });
    return Object.entries(map)
      .map(([id, amount]) => {
        const cat = categories.find((c) => c.id === id);
        return {
          id,
          name: cat?.name || "Uncategorized",
          key: cat?.key || "shopping",
          amount,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  // Estimated Tax summary calculations
  const taxSummary = useMemo(() => {
    // Basic tax calculation logic
    const totalIncome = totals.income;
    const taxRate = 0.15; // 15% flat estimation for demo
    const estimatedTax = totalIncome * taxRate;
    const disposableIncome = totalIncome - estimatedTax - totals.expense;
    return {
      income: totalIncome,
      rate: taxRate * 100,
      estimatedTax,
      disposableIncome,
    };
  }, [totals]);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="kicker text-primary font-semibold">Ledger Statements</div>
          <h1 className="display text-3xl text-ink font-bold">This month&apos;s progress</h1>
          <p className="text-muted text-sm mt-1">Generate polished, audit-ready financial statement reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="h-10 text-xs font-bold">
            <Printer size={14} /> Print Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line mb-6 gap-6">
        {(["monthly", "annual", "category", "tax"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "pb-3 text-sm font-bold border-b-2 transition-colors capitalize",
              activeTab === tab ? "border-transparent text-primary" : "border-transparent text-muted hover:text-ink"
            )}
          >
            {tab === "tax" ? "Tax Summary" : `${tab} report`}
            {activeTab === tab && (
              <motion.span
                layoutId="reports-tab-underline"
                className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Report views */}
      <div className="space-y-6">
        {activeTab === "monthly" && (
          <div className="card p-6 bg-surface space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-lg font-bold text-ink">Monthly Statement</h3>
                <p className="text-xs text-muted mt-0.5">Consolidated cash flow statement for the current month.</p>
              </div>
              <span className="text-xs font-bold text-muted bg-surface-2 border border-line px-2.5 py-1 rounded-lg">
                {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Receipts &amp; Credits</h4>
                <div className="flex justify-between items-center text-sm border-b border-line py-2">
                  <span className="text-muted">Direct Deposits / Salary</span>
                  <span className="font-bold text-primary">{formatMoney(totals.income, user.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold border-t border-line py-2 text-ink">
                  <span>Total Income</span>
                  <span>{formatMoney(totals.income, user.currency)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Debits &amp; Deductions</h4>
                <div className="flex justify-between items-center text-sm border-b border-line py-2">
                  <span className="text-muted">Category Expenses</span>
                  <span className="font-bold text-[#DC2626]">{formatMoney(totals.expense, user.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold border-t border-line py-2 text-ink">
                  <span>Total Expense</span>
                  <span>{formatMoney(totals.expense, user.currency)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-2 p-4 rounded-xl">
              <div>
                <div className="text-xs font-bold text-muted uppercase tracking-wider">Net Retained Earnings</div>
                <div className={clsx("display text-2xl font-bold mt-1", totals.net >= 0 ? "text-primary" : "text-[#DC2626]")}>
                  {formatMoney(totals.net, user.currency)}
                </div>
              </div>
              <span className="text-xs text-muted max-w-sm">
                Retained earnings have been securely consolidated into your active net worth portfolio.
              </span>
            </div>
          </div>
        )}

        {activeTab === "annual" && (
          <div className="card p-6 bg-surface space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-lg font-bold text-ink">Annual Projection</h3>
                <p className="text-xs text-muted mt-0.5">Projected annualized totals based on current run-rates.</p>
              </div>
              <span className="text-xs font-bold text-muted bg-surface-2 border border-line px-2.5 py-1 rounded-lg">
                12-Month Run Rate
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-line pb-2.5 text-sm">
                <span className="text-muted">Estimated Annual Income</span>
                <span className="font-bold text-ink">{formatMoney(totals.income * 12, user.currency)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-line pb-2.5 text-sm">
                <span className="text-muted">Estimated Annual Expense</span>
                <span className="font-bold text-ink">{formatMoney(totals.expense * 12, user.currency)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-line pt-3 text-sm font-bold text-ink bg-surface-2 p-3 rounded-lg">
                <span>Projected Net Annual Savings</span>
                <span className="text-primary">{formatMoney(totals.net * 12, user.currency)}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "category" && (
          <div className="card p-6 bg-surface space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-lg font-bold text-ink">Category Expenditure Statement</h3>
                <p className="text-xs text-muted mt-0.5">Detailed breakdown of expense allocations sorted by magnitude.</p>
              </div>
              <span className="text-xs font-bold text-muted bg-surface-2 border border-line px-2.5 py-1 rounded-lg">
                This Month
              </span>
            </div>

            <div className="space-y-3">
              {categoryAggregates.map((c) => {
                const meta = CATEGORY_META[c.key];
                return (
                  <div key={c.id} className="flex justify-between items-center border-b border-line pb-2 last:border-0 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ background: meta?.hue ?? "var(--primary)" }} />
                      <span className="font-semibold text-ink">{c.name}</span>
                    </div>
                    <span className="font-bold text-ink">{formatMoney(c.amount, user.currency)}</span>
                  </div>
                );
              })}
              {categoryAggregates.length === 0 && (
                <div className="text-center py-6 text-sm text-muted">No categorized expenses on file for this month.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "tax" && (
          <div className="card p-6 bg-surface space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-lg font-bold text-ink">Tax Estimation Summary</h3>
                <p className="text-xs text-muted mt-0.5">Estimated tax liabilities and withholding suggestions.</p>
              </div>
              <span className="text-xs font-bold text-muted bg-surface-2 border border-line px-2.5 py-1 rounded-lg">
                FY {new Date().getFullYear()} Est.
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-line pb-2 text-sm">
                <span className="text-muted">Total Gross Receipts</span>
                <span className="font-bold text-ink">{formatMoney(taxSummary.income, user.currency)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-line pb-2 text-sm">
                <span className="text-muted">Estimated Tax Bracket slab</span>
                <span className="font-bold text-ink">{taxSummary.rate}% flat</span>
              </div>
              <div className="flex justify-between items-center border-b border-line pb-2 text-sm text-danger font-semibold">
                <span>Est. Income Tax Liability</span>
                <span>-{formatMoney(taxSummary.estimatedTax, user.currency)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-line pt-3 text-sm font-bold text-ink bg-surface-2 p-3 rounded-lg">
                <span>Est. Net Disposable Earnings</span>
                <span className="text-primary">{formatMoney(taxSummary.disposableIncome, user.currency)}</span>
              </div>
            </div>

            <div className="text-xs text-muted flex items-start gap-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
              <Calculator size={14} className="text-primary mt-0.5 shrink-0" />
              <span>
                Disclaimer: MoneyTrail tax reports are mathematical estimations for reference purposes only and do not constitute certified tax or legal advice.
              </span>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

