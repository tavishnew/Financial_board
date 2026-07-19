import { describe, it, expect } from "vitest";
import { netWorth, monthTotals, topCategory, recentTransactions } from "./selectors";
import type { Account, Transaction, Category } from "./types";

const accounts: Account[] = [
  { id: "a1", name: "Bank", balance: 1000, type: "bank", archived: false },
  { id: "a2", name: "Card", balance: -200, type: "card", archived: false },
];

const cats: Category[] = [
  { id: "c1", key: "food", name: "Food", isDefault: true },
  { id: "c2", key: "savings", name: "Savings", isDefault: true },
];

const day = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const txns: Transaction[] = [
  { id: "t1", type: "expense", amount: 50, categoryId: "c1", accountId: "a1", note: "", date: day(2), tags: [] },
  { id: "t2", type: "income", amount: 500, categoryId: "c2", accountId: "a1", note: "", date: day(1), tags: [] },
  // Previous month -> excluded from current-month aggregates.
  { id: "t3", type: "expense", amount: 30, categoryId: "c1", accountId: "a1", note: "", date: day(40), tags: [] },
];

describe("selectors", () => {
  it("netWorth sums non-archived account balances", () => {
    expect(netWorth(accounts)).toBe(800);
  });
  it("monthTotals scopes to the current month", () => {
    const t = monthTotals(txns);
    expect(t.income).toBe(500);
    expect(t.expense).toBe(50); // t3 is in a prior month, excluded
    expect(t.net).toBe(450);
  });
  it("topCategory returns the highest expense this month", () => {
    const top = topCategory(txns, cats);
    expect(top?.category.key).toBe("food");
    expect(top?.amount).toBe(50);
  });
  it("recentTransactions returns n most recent", () => {
    expect(recentTransactions(txns, 2).length).toBe(2);
  });
});
