"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  Holding,
  Trade,
  TradeType,
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
  holdings: Holding[];
  trades: Trade[];
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
  setAvatar: (url: string) => Promise<void>;
  addHolding: (h: { symbol: string; name: string; shares: number; avgCost: number }) => Promise<void>;
  deleteHolding: (id: string) => Promise<void>;
  addTrade: (id: string, t: { type: TradeType; shares: number; price: number; note?: string }) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const emptyState: StoreState = {
  user: { id: "", email: "", name: "", currency: "USD" },
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
  holdings: [],
  trades: [],
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
  const stateRef = useRef<StoreState>(emptyState);
  stateRef.current = state;

  // Hydrate from the session-protected API once authenticated.
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    let cancelled = false;
    (async () => {
      try {
       let [transactions, accounts, categories, budgets, goals] = await Promise.all([
         loadJSON<Transaction[]>("/api/transactions"),
         loadJSON<Account[]>("/api/accounts"),
         loadJSON<Category[]>("/api/categories"),
         loadJSON<Budget[]>("/api/budgets"),
         loadJSON<Goal[]>("/api/goals"),
       ]);
       if (cancelled) return;
        // Auto-seed categories for existing users who may not have them
        if (categories.length === 0) {
          await fetch("/api/categories/auto-seed", { method: "POST" }).catch(() => {});
          // Re-fetch categories after seeding
          categories = await loadJSON<Category[]>("/api/categories");
        }
        if (cancelled) return;
       const user: User = {
         id: session.user?.id ?? "",
         email: session.user?.email ?? "",
         name: session.user?.name ?? "You",
         currency: (session.user as { currency?: string })?.currency ?? "USD",
       };
       let holdings: Holding[] = [];
        try {
          holdings = await loadJSON<Holding[]>("/api/holdings");
        } catch {
          holdings = [];
        }
        if (cancelled) return;
        setState({ user, accounts, categories, transactions, budgets, goals, holdings, trades: [] });
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

  const setAvatar = useCallback(
    async (url: string) => {
      setState((s) => ({ ...s, user: { ...s.user, avatarUrl: url } }));
      try {
        await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: url }),
        });
      } catch {
        /* non-fatal: keep optimistic local value */
      }
    },
    []
  );

  const addHolding = useCallback(
    async (h: { symbol: string; name: string; shares: number; avgCost: number }) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const optimistic: Holding = {
        id: tempId,
        symbol: h.symbol.trim().toUpperCase(),
        name: h.name.trim(),
        shares: h.shares,
        avgCost: h.avgCost,
        createdAt: new Date().toISOString(),
      };
      // Optimistic insert.
      setState((s) => ({ ...s, holdings: [...s.holdings, optimistic] }));
      try {
        const res = await fetch("/api/holdings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(h),
        });
        if (!res.ok) throw new Error("create failed");
        const created = (await res.json()) as Holding;
        setState((s) => ({
          ...s,
          holdings: s.holdings.map((x) => (x.id === tempId ? created : x)),
        }));
      } catch {
        setState((s) => ({ ...s, holdings: s.holdings.filter((x) => x.id !== tempId) }));
        toast("Could not add investment", "error");
      }
    },
    [toast]
  );

  const deleteHolding = useCallback(
    async (id: string) => {
      const snapshot = stateRef.current.holdings;
      const target = snapshot.find((h) => h.id === id);
      if (!target) return;
      // Optimistic remove.
      setState((s) => ({ ...s, holdings: s.holdings.filter((h) => h.id !== id) }));
      try {
        const res = await fetch(`/api/holdings/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("delete failed");
      } catch {
        setState((s) => ({ ...s, holdings: snapshot }));
        toast("Could not remove investment", "error");
      }
    },
    [toast]
  );

  const addTrade = useCallback(
    async (id: string, t: { type: TradeType; shares: number; price: number; note?: string }) => {
      const snapshot = stateRef.current.holdings;
      const holding = snapshot.find((h) => h.id === id);
      if (!holding) return;

      // Optimistically compute the next holding state.
      let nextShares: number;
      let nextAvg: number;
      if (t.type === "buy") {
        nextShares = holding.shares + t.shares;
        nextAvg = (holding.shares * holding.avgCost + t.shares * t.price) / nextShares;
      } else {
        nextShares = holding.shares - t.shares;
        nextAvg = holding.avgCost;
      }
      const sellAll = t.type === "sell" && Math.abs(t.shares - holding.shares) < 1e-9;
      setState((s) => ({
        ...s,
        holdings: s.holdings
          .map((h) => (h.id === id ? { ...h, shares: nextShares, avgCost: nextAvg } : h))
          .filter((h) => !(sellAll && h.id === id)),
      }));

      try {
        const res = await fetch(`/api/holdings/${id}/trades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(t),
        });
        if (!res.ok) throw new Error("trade failed");
        const data = (await res.json()) as { deleted?: boolean; symbol?: string } & Holding;
        setState((s) => {
          if (data.deleted) {
            return { ...s, holdings: s.holdings.filter((h) => h.id !== id), trades: [...s.trades, localTrade(holding, t)] };
          }
          const merged: Holding = { ...data, shares: data.shares, avgCost: data.avgCost };
          return {
            ...s,
            holdings: s.holdings.map((h) => (h.id === id ? merged : h)),
            trades: [...s.trades, localTrade(holding, t)],
          };
        });
      } catch {
        setState((s) => ({ ...s, holdings: snapshot }));
        toast("Could not record trade", "error");
      }
    },
    [toast]
  );

  // Build a local Trade record for state (the server persists the real one).
  function localTrade(holding: Holding, t: { type: TradeType; shares: number; price: number; note?: string }): Trade {
    return {
      id: `local-${Date.now()}`,
      holdingId: holding.id,
      symbol: holding.symbol,
      type: t.type,
      shares: t.shares,
      price: t.price,
      note: t.note,
      date: new Date().toISOString(),
    };
  }

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
      setAvatar,
      addHolding,
      deleteHolding,
      addTrade,
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
      addHolding,
      deleteHolding,
      addTrade,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}


