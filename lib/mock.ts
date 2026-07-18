import type {
  Account,
  Budget,
  Category,
  CategoryKey,
  Goal,
  Transaction,
  User,
} from "./types";

export const currentUser: User = {
  id: "u-1",
  email: "tavis@finance.app",
  name: "Tavis",
  currency: "INR",
};

export const seedAccounts: Account[] = [
  { id: "acc-salary", name: "Salary Account", type: "bank", balance: 184250, archived: false },
  { id: "acc-wallet", name: "Wallet", type: "cash", balance: 4200, archived: false },
  { id: "acc-sapphire", name: "Sapphire Card", type: "card", balance: -18200, archived: false },
  { id: "acc-savings", name: "Emergency Fund", type: "bank", balance: 96000, archived: false },
];

export const seedCategories: Category[] = (
  ["food", "transport", "shopping", "bills", "fun", "health", "savings"] as CategoryKey[]
).map((key) => ({ id: `cat-${key}`, key, name: key[0].toUpperCase() + key.slice(1), isDefault: true }));

const catId = (key: CategoryKey) => `cat-${key}`;

// Deterministic RNG so the demo data is stable across reloads.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOTES: Record<CategoryKey, string[]> = {
  food: ["Grocery run", "Cafe latte", "Dinner out", "Swiggy order", "Bakery"],
  transport: ["Metro pass", "Cab to airport", "Fuel", "Auto ride", "Parking"],
  shopping: ["New headphones", "Amazon haul", "Shoes", "Gift", "Home stuff"],
  bills: ["Electricity", "Mobile recharge", "Internet", "Rent share", "Subscription"],
  fun: ["Movie night", "Concert ticket", "Game pass", "Board game", "Streaming"],
  health: ["Pharmacy", "Gym membership", "Checkup", "Yoga class", "Vitamins"],
  savings: ["MF SIP", "RD deposit", "Emergency top-up", "Index fund", "Piggy bank"],
};

const AMOUNTS: Record<CategoryKey, [number, number]> = {
  food: [120, 1400],
  transport: [40, 900],
  shopping: [350, 4200],
  bills: [199, 5200],
  fun: [199, 1800],
  health: [150, 2600],
  savings: [1500, 9000],
};

const KEYS = Object.keys(NOTES) as CategoryKey[];

function buildTransactions(): Transaction[] {
  const rnd = mulberry32(20260718);
  const list: Transaction[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Salary income on the 1st of each of the last 3 months.
  for (let m = 2; m >= 0; m--) {
    const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
    list.push({
      id: `txn-sal-${m}`,
      type: "income",
      amount: 145000,
      categoryId: null,
      accountId: "acc-salary",
      note: "Monthly salary",
      tags: ["salary"],
      date: d.toISOString(),
    });
  }

  // ~70 expense transactions spread across the last ~90 days.
  for (let i = 0; i < 72; i++) {
    const daysAgo = Math.floor(rnd() * 90);
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const key = KEYS[Math.floor(rnd() * KEYS.length)];
    const [lo, hi] = AMOUNTS[key];
    const amount = Math.round((lo + rnd() * (hi - lo)) / 10) * 10;
    const notes = NOTES[key];
    const acct = key === "savings" ? "acc-savings" : rnd() > 0.5 ? "acc-salary" : "acc-sapphire";
    list.push({
      id: `txn-${i}`,
      type: "expense",
      amount,
      categoryId: catId(key),
      accountId: acct,
      note: notes[Math.floor(rnd() * notes.length)],
      tags: [],
      date: d.toISOString(),
    });
  }
  return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export const seedTransactions: Transaction[] = buildTransactions();

export const seedBudgets: Budget[] = [
  { id: "bud-food", categoryId: catId("food"), limit: 12000, period: "monthly" },
  { id: "bud-transport", categoryId: catId("transport"), limit: 5000, period: "monthly" },
  { id: "bud-shopping", categoryId: catId("shopping"), limit: 9000, period: "monthly" },
  { id: "bud-bills", categoryId: catId("bills"), limit: 12000, period: "monthly" },
  { id: "bud-fun", categoryId: catId("fun"), limit: 4000, period: "monthly" },
  { id: "bud-health", categoryId: catId("health"), limit: 3500, period: "monthly" },
];

export const seedGoals: Goal[] = [
  {
    id: "goal-japan",
    name: "Japan Trip 2027",
    targetAmount: 350000,
    currentAmount: 126000,
    deadline: new Date(new Date().getFullYear() + 1, 2, 1).toISOString(),
  },
  {
    id: "goal-laptop",
    name: "New Laptop",
    targetAmount: 150000,
    currentAmount: 96500,
  },
  {
    id: "goal-ef",
    name: "Emergency Fund",
    targetAmount: 300000,
    currentAmount: 96000,
    accountId: "acc-savings",
  },
];
