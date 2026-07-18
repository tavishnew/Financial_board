import type { Account, Budget, Category, Transaction } from "./types";
import { monthKey } from "./format";

export function netWorth(accounts: Account[]): number {
  return accounts.filter((a) => !a.archived).reduce((sum, a) => sum + a.balance, 0);
}

export function monthRange(fromMonthsAgo = 0): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - fromMonthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - fromMonthsAgo + 1, 0, 23, 59, 59);
  return { start, end };
}

export function inMonth(txn: Transaction, monthsAgo = 0): boolean {
  const { start, end } = monthRange(monthsAgo);
  const d = new Date(txn.date);
  return d >= start && d <= end;
}

export function monthTotals(transactions: Transaction[], monthsAgo = 0) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (!inMonth(t, monthsAgo)) continue;
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

export function categorySpend(transactions: Transaction[], monthsAgo = 0): Record<string, number> {
  const map: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type !== "expense" || !t.categoryId) continue;
    if (!inMonth(t, monthsAgo)) continue;
    map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
  }
  return map;
}

export function topCategory(
  transactions: Transaction[],
  categories: Category[],
  monthsAgo = 0
) {
  const spend = categorySpend(transactions, monthsAgo);
  let best: { category: Category; amount: number } | null = null;
  for (const c of categories) {
    const amount = spend[c.id] ?? 0;
    if (!best || amount > best.amount) best = { category: c, amount };
  }
  return best;
}

export interface CategorySlice {
  key: string;
  name: string;
  value: number;
  hue: string;
}

export function categoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  monthsAgo = 0
): CategorySlice[] {
  const spend = categorySpend(transactions, monthsAgo);
  const metaMap = categories.reduce<Record<string, Category>>((m, c) => {
    m[c.id] = c;
    return m;
  }, {});
  return Object.entries(spend)
    .map(([id, value]) => {
      const cat = metaMap[id];
      return { key: id, name: cat?.name ?? "Other", value, hue: "var(--primary)" };
    })
    .sort((a, b) => b.value - a.value);
}

export interface TrendPoint {
  label: string;
  income: number;
  expense: number;
  net: number;
}

export function monthlyTrend(transactions: Transaction[], months = 6): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const { income, expense, net } = monthTotals(transactions, i);
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    points.push({
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      income,
      expense,
      net,
    });
  }
  return points;
}

export interface BudgetProgress {
  budget: Budget;
  category: Category | undefined;
  spent: number;
  limit: number;
  pct: number;
  remaining: number;
  over: boolean;
}

export function budgetProgress(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  monthsAgo = 0
): BudgetProgress[] {
  const spend = categorySpend(transactions, monthsAgo);
  const catMap = categories.reduce<Record<string, Category>>((m, c) => {
    m[c.id] = c;
    return m;
  }, {});
  return budgets
    .map((b) => {
      const spent = spend[b.categoryId] ?? 0;
      const pct = b.limit === 0 ? 0 : Math.round((spent / b.limit) * 100);
      return {
        budget: b,
        category: catMap[b.categoryId],
        spent,
        limit: b.limit,
        pct,
        remaining: b.limit - spent,
        over: spent > b.limit,
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

export function recentTransactions(transactions: Transaction[], n = 6): Transaction[] {
  return [...transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, n);
}

export function dailyTrend(transactions: Transaction[], days = 14) {
  const now = new Date();
  const points: { day: string; expense: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = monthKey(d.toISOString());
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    const expense = transactions
      .filter((t) => t.type === "expense" && new Date(t.date) >= dayStart && new Date(t.date) <= dayEnd)
      .reduce((s, t) => s + t.amount, 0);
    points.push({ day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), expense });
  }
  return points;
}
