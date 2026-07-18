"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Account,
  Budget,
  Category,
  CategoryKey,
  Goal,
  Transaction,
  User,
} from "./types";
import {
  currentUser,
  seedAccounts,
  seedBudgets,
  seedCategories,
  seedGoals,
  seedTransactions,
} from "./mock";

interface NewTransaction {
  type: Transaction["type"];
  amount: number;
  categoryId: string | null;
  accountId: string;
  note?: string;
  date: string;
}

interface StoreState {
  user: User;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}

interface StoreContextValue extends StoreState {
  addTransaction: (t: NewTransaction) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (a: Omit<Account, "id">) => void;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  archiveAccount: (id: string) => void;
  addCategory: (key: CategoryKey, name: string) => void;
  deleteCategory: (id: string) => void;
  upsertBudget: (categoryId: string, limit: number) => void;
  deleteBudget: (id: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setCurrency: (code: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>({
    user: currentUser,
    accounts: seedAccounts,
    categories: seedCategories,
    transactions: seedTransactions,
    budgets: seedBudgets,
    goals: seedGoals,
  });

  const addTransaction = useCallback((t: NewTransaction) => {
    setState((s) => {
      const txn: Transaction = { id: nextId("txn"), tags: [], ...t };
      const accounts = s.accounts.map((a) =>
        a.id === t.accountId
          ? { ...a, balance: a.balance + (t.type === "income" ? t.amount : -t.amount) }
          : a
      );
      return { ...s, transactions: [txn, ...s.transactions], accounts };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState((s) => {
      const txn = s.transactions.find((t) => t.id === id);
      if (!txn) return s;
      const accounts = s.accounts.map((a) =>
        a.id === txn.accountId
          ? { ...a, balance: a.balance - (txn.type === "income" ? txn.amount : -txn.amount) }
          : a
      );
      return {
        ...s,
        transactions: s.transactions.filter((t) => t.id !== id),
        accounts,
      };
    });
  }, []);

  const addAccount = useCallback((a: Omit<Account, "id">) => {
    setState((s) => ({ ...s, accounts: [...s.accounts, { ...a, id: nextId("acc") }] }));
  }, []);

  const updateAccount = useCallback((id: string, patch: Partial<Account>) => {
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const archiveAccount = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, archived: !a.archived } : a)),
    }));
  }, []);

  const addCategory = useCallback((key: CategoryKey, name: string) => {
    setState((s) => ({
      ...s,
      categories: [...s.categories, { id: nextId("cat"), key, name, isDefault: false }],
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  }, []);

  const upsertBudget = useCallback((categoryId: string, limit: number) => {
    setState((s) => {
      const existing = s.budgets.find((b) => b.categoryId === categoryId);
      if (existing) {
        return {
          ...s,
          budgets: s.budgets.map((b) => (b.categoryId === categoryId ? { ...b, limit } : b)),
        };
      }
      return { ...s, budgets: [...s.budgets, { id: nextId("bud"), categoryId, limit, period: "monthly" }] };
    });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setState((s) => ({ ...s, budgets: s.budgets.filter((b) => b.id !== id) }));
  }, []);

  const addGoal = useCallback((g: Omit<Goal, "id">) => {
    setState((s) => ({ ...s, goals: [...s.goals, { ...g, id: nextId("goal") }] }));
  }, []);

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  }, []);

  const setCurrency = useCallback((code: string) => {
    setState((s) => ({ ...s, user: { ...s.user, currency: code } }));
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      addTransaction,
      deleteTransaction,
      addAccount,
      updateAccount,
      archiveAccount,
      addCategory,
      deleteCategory,
      upsertBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      setCurrency,
    }),
    [state, addTransaction, deleteTransaction, addAccount, updateAccount, archiveAccount, addCategory, deleteCategory, upsertBudget, deleteBudget, addGoal, updateGoal, deleteGoal, setCurrency]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
