import type { Transaction, Account, Category } from "./types";

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "1", date: "2024-01-15", note: "Grocery shopping", amount: 85, type: "expense", categoryId: "cat-food", accountId: "1", tags: [] },
  { id: "2", date: "2024-01-14", note: "Salary", amount: 3000, type: "income", categoryId: null, accountId: "1", tags: [] },
  { id: "3", date: "2024-01-13", note: "Uber ride", amount: 22, type: "expense", categoryId: "cat-transport", accountId: "1", tags: [] },
  { id: "4", date: "2024-01-12", note: "Amazon order", amount: 120, type: "expense", categoryId: "cat-shopping", accountId: "1", tags: [] },
  { id: "5", date: "2024-01-10", note: "Electric bill", amount: 150, type: "expense", categoryId: "cat-bills", accountId: "1", tags: [] },
  { id: "6", date: "2024-01-09", note: "Concert tickets", amount: 180, type: "expense", categoryId: "cat-fun", accountId: "1", tags: [] },
  { id: "7", date: "2024-01-08", note: "Pharmacy", amount: 45, type: "expense", categoryId: "cat-health", accountId: "1", tags: [] },
  { id: "8", date: "2024-01-05", note: "Savings transfer", amount: 500, type: "expense", categoryId: "cat-savings", accountId: "1", tags: [] },
];

export const DEMO_ACCOUNTS: Account[] = [
  { id: "1", name: "Checking", type: "bank", balance: 2500, archived: false },
  { id: "2", name: "Savings", type: "bank", balance: 10000, archived: false },
  { id: "3", name: "Cash", type: "cash", balance: 150, archived: false },
];

export const DEMO_CATEGORIES: Category[] = [
  { id: "cat-food", key: "food", name: "Food", isDefault: true },
  { id: "cat-transport", key: "transport", name: "Transport", isDefault: true },
  { id: "cat-shopping", key: "shopping", name: "Shopping", isDefault: true },
  { id: "cat-bills", key: "bills", name: "Bills", isDefault: true },
  { id: "cat-fun", key: "fun", name: "Fun", isDefault: true },
  { id: "cat-health", key: "health", name: "Health", isDefault: true },
  { id: "cat-savings", key: "savings", name: "Savings", isDefault: true },
];