"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type {
  Account,
  Budget,
  Category,
  CategoryKey,
  Goal,
  Transaction,
  User,
} from "./types";
import { useToast } from "@/components/Toast";

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
  addTransaction: (t: NewTransaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (a: Omit<Account, "id">) => Promise<void>;
  updateAccount: (id: string, patch: Partial<Account>) => Promise<void>;
  archiveAccount: (id: string) => Promise<void>;
  addCategory: (key: CategoryKey, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  upsertBudget: (categoryId: string, limit: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setCurrency: (code: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const emptyState: StoreState = {
  user: { id: "", email: "", name: "", currency: "USD" },
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
};

async function loadJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return (await res.json()) as T;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const toast = useToast();
  const [state, setState] = useState<StoreState>(emptyState);

  // Hydrate from the session-protected API once authenticated.
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    let cancelled = false;
    (async () => {
      try {
        const [transactions, accounts, categories, budgets, goals] = await Promise.all([
          loadJSON<Transaction[]>("/api/transactions"),
          loadJSON<Account[]>("/api/accounts"),
          loadJSON<Category[]>("/api/categories"),
          loadJSON<Budget[]>("/api/budgets"),
          loadJSON<Goal[]>("/api/goals"),
        ]);
        if (cancelled) return;
        const user: User = {
          id: session.user.id ?? "",
          email: session.user.email ?? "",
          name: session.user.name ?? "You",
          currency: (session.user as { currency?: string }).currency ?? "USD",
        };
        setState({ user, accounts, categories, transactions, budgets, goals });
      } catch {
        toast("Could not load your data", "error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id, toast]);

  const addTransaction = useCallback(
    async (t: NewTransaction) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
      if (!res.ok) {
        toast("Could not add transaction", "error");
        return;
      }
      const created = (await res.json()) as Transaction;
      setState((s) => {
        const delta = created.type === "income" ? created.amount : -created.amount;
        const accounts = s.accounts.map((a) =>
          a.id === created.accountId ? { ...a, balance: a.balance + delta } : a
        );
        return { ...s, transactions: [created, ...s.transactions], accounts };
      });
    },
    [toast]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const txn = state.transactions.find((t) => t.id === id);
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("Could not delete transaction", "error");
        return;
      }
      setState((s) => {
        const delta = txn && txn.type === "income" ? -txn.amount : txn?.amount ?? 0;
        const accounts = txn
          ? s.accounts.map((a) =>
              a.id === txn.accountId ? { ...a, balance: a.balance + delta } : a
            )
          : s.accounts;
        return {
          ...s,
          transactions: s.transactions.filter((t) => t.id !== id),
          accounts,
        };
      });
    },
    [state.transactions, state.accounts, toast]
  );

  const addAccount = useCallback(
    async (a: Omit<Account, "id">) => {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      });
      if (!res.ok) {
        toast("Could not add account", "error");
        return;
      }
      const created = (await res.json()) as Account;
      setState((s) => ({ ...s, accounts: [...s.accounts, created] }));
    },
    [toast]
  );

  const updateAccount = useCallback(
    async (id: string, patch: Partial<Account>) => {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        toast("Could not update account", "error");
        return;
      }
      const updated = (await res.json()) as Account;
      setState((s) => ({
        ...s,
        accounts: s.accounts.map((a) => (a.id === id ? updated : a)),
      }));
    },
    [toast]
  );

  const archiveAccount = useCallback(
    async (id: string) => {
      const acc = state.accounts.find((a) => a.id === id);
      if (!acc) return;
      await updateAccount(id, { archived: !acc.archived });
    },
    [state.accounts, updateAccount]
  );

  const addCategory = useCallback(
    async (key: CategoryKey, name: string) => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, name, isDefault: false }),
      });
      if (!res.ok) {
        toast("Could not add category", "error");
        return;
      }
      const created = (await res.json()) as Category;
      setState((s) => ({ ...s, categories: [...s.categories, created] }));
    },
    [toast]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("Could not delete category", "error");
        return;
      }
      setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
    },
    [toast]
  );

  const upsertBudget = useCallback(
    async (categoryId: string, limit: number) => {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, limit }),
      });
      if (!res.ok) {
        toast("Could not save budget", "error");
        return;
      }
      const saved = (await res.json()) as Budget;
      setState((s) => {
        const others = s.budgets.filter((b) => b.categoryId !== categoryId);
        return { ...s, budgets: [...others, saved] };
      });
    },
    [toast]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("Could not delete budget", "error");
        return;
      }
      setState((s) => ({ ...s, budgets: s.budgets.filter((b) => b.id !== id) }));
    },
    [toast]
  );

  const addGoal = useCallback(
    async (g: Omit<Goal, "id">) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(g),
      });
      if (!res.ok) {
        toast("Could not add goal", "error");
        return;
      }
      const created = (await res.json()) as Goal;
      setState((s) => ({ ...s, goals: [...s.goals, created] }));
    },
    [toast]
  );

  const updateGoal = useCallback(
    async (id: string, patch: Partial<Goal>) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        toast("Could not update goal", "error");
        return;
      }
      const updated = (await res.json()) as Goal;
      setState((s) => ({
        ...s,
        goals: s.goals.map((g) => (g.id === id ? updated : g)),
      }));
    },
    [toast]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("Could not delete goal", "error");
        return;
      }
      setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
    },
    [toast]
  );

  const setCurrency = useCallback(
    async (code: string) => {
      setState((s) => ({ ...s, user: { ...s.user, currency: code } }));
      try {
        await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currency: code }),
        });
      } catch {
        /* non-fatal: keep optimistic local value */
      }
    },
    []
  );

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
    [
      state,
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
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
