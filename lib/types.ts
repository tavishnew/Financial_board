export type AccountType = "cash" | "bank" | "card" | "wallet";
export type TxnType = "income" | "expense";

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  avatarUrl?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  archived: boolean;
}

export type CategoryKey =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "fun"
  | "health"
  | "savings";

export interface Category {
  id: string;
  key: CategoryKey;
  name: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TxnType;
  amount: number;
  categoryId: string | null;
  accountId: string;
  note?: string;
  tags: string[];
  date: string; // ISO
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  period: "monthly" | "weekly";
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  accountId?: string;
}

export type TradeType = "buy" | "sell";

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  createdAt: string;
}

export interface Trade {
  id: string;
  holdingId: string | null;
  symbol: string;
  type: TradeType;
  shares: number;
  price: number;
  note?: string;
  date: string;
}
