import type { Account, Budget, Category, Goal, Transaction, TxnType } from "./types";
import { CATEGORY_META, CATEGORY_ORDER } from "./categories";

// Illustrative, non-personal sample data used to keep the public landing page and
// empty dashboards feeling alive. Shown only when the live store has no real data.

export const DEMO_CATEGORIES: Category[] = CATEGORY_ORDER.map((key, i) => ({
  id: `demo-cat-${i}`,
  key,
  name: CATEGORY_META[key].name,
  isDefault: true,
}));

const idFor = (key: (typeof CATEGORY_ORDER)[number]) =>
  DEMO_CATEGORIES.find((c) => c.key === key)!.id;

export const DEMO_ACCOUNTS: Account[] = [
  { id: "demo-acc-0", name: "Salary Account", type: "bank", balance: 18420, archived: false },
  { id: "demo-acc-1", name: "Everyday Card", type: "card", balance: 2360, archived: false },
  { id: "demo-acc-2", name: "Cash Wallet", type: "cash", balance: 320, archived: false },
];

const dAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

let _id = 0;
const mk = (
  type: TxnType,
  amount: number,
  key: (typeof CATEGORY_ORDER)[number] | null,
  daysAgo: number,
  note: string
): Transaction => ({
  id: `demo-txn-${++_id}`,
  type,
  amount,
  categoryId: key ? idFor(key) : null,
  accountId: "demo-acc-0",
  note,
  tags: [],
  date: dAgo(daysAgo),
});

const txns: Transaction[] = [];

// Income: monthly salary + a freelance top-up
[3, 33, 63, 93, 123, 153].forEach((d) => txns.push(mk("income", 11000, null, d, "Monthly salary")));
txns.push(mk("income", 1400, null, 78, "Freelance project"));

// Food
[1, 4, 8, 12, 16, 20, 24, 28, 31, 36, 41, 47, 52, 58, 64, 71, 77, 84, 91, 98, 106, 114, 122, 131, 140, 149, 158, 168].forEach(
  (d, i) => txns.push(mk("expense", 240 + ((i * 37) % 180), "food", d, i % 3 === 0 ? "Groceries" : "Lunch out"))
);
// Transport
[2, 9, 15, 22, 29, 38, 46, 55, 66, 75, 88, 102, 117, 133, 145, 162].forEach((d, i) =>
  txns.push(mk("expense", 80 + ((i * 23) % 120), "transport", d, i % 2 ? "Metro pass" : "Fuel"))
);
// Shopping
[6, 19, 44, 70, 96, 128, 156].forEach((d, i) =>
  txns.push(mk("expense", 600 + ((i * 311) % 1400), "shopping", d, i % 2 ? "Clothing" : "Gadgets"))
);
// Bills
[5, 35, 65, 95, 125, 155].forEach((d) => txns.push(mk("expense", 1450, "bills", d, "Rent")));
[10, 40, 70, 100, 130, 160].forEach((d, i) => txns.push(mk("expense", 120 + ((i * 17) % 80), "bills", d, "Utilities")));
// Fun
[7, 18, 34, 53, 73, 89, 110, 137, 165].forEach((d, i) =>
  txns.push(mk("expense", 200 + ((i * 53) % 500), "fun", d, i % 2 ? "Streaming" : "Concert"))
);
// Health
[14, 49, 84, 119, 152].forEach((d, i) => txns.push(mk("expense", 90 + ((i * 29) % 160), "health", d, i % 2 ? "Pharmacy" : "Gym")));
// Savings
[11, 41, 71, 101, 131, 161].forEach((d) => txns.push(mk("expense", 800, "savings", d, "Savings transfer")));

export const DEMO_TRANSACTIONS = txns;

export const DEMO_BUDGETS: Budget[] = [
  { id: "demo-b-0", categoryId: idFor("food"), limit: 3500, period: "monthly" },
  { id: "demo-b-1", categoryId: idFor("shopping"), limit: 2200, period: "monthly" },
  { id: "demo-b-2", categoryId: idFor("bills"), limit: 1400, period: "monthly" },
  { id: "demo-b-3", categoryId: idFor("fun"), limit: 1200, period: "monthly" },
];

export const DEMO_GOALS: Goal[] = [
  { id: "demo-g-0", name: "Emergency Fund", targetAmount: 50000, currentAmount: 31200, deadline: new Date(new Date().getFullYear() + 1, 0, 1).toISOString() },
  { id: "demo-g-1", name: "Japan Trip", targetAmount: 240000, currentAmount: 96000, deadline: new Date(new Date().getFullYear() + 1, 5, 1).toISOString() },
];
