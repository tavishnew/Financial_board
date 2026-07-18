import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [accounts, monthTxns, recent, budgets, categories] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id, archived: false } }),
    prisma.transaction.findMany({ where: { userId: user.id, date: { gte: start, lte: end } } }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 6,
    }),
    prisma.budget.findMany({ where: { userId: user.id } }),
    prisma.category.findMany({ where: { userId: user.id } }),
  ]);

  const netWorth = accounts.reduce((s, a) => s + num(a.balance), 0);
  let income = 0;
  let expense = 0;
  const spendByCat: Record<string, number> = {};
  for (const t of monthTxns) {
    const amt = num(t.amount);
    if (t.type === "income") income += amt;
    else {
      expense += amt;
      if (t.categoryId) spendByCat[t.categoryId] = (spendByCat[t.categoryId] ?? 0) + amt;
    }
  }

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const topCategoryId = Object.entries(spendByCat).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return NextResponse.json({
    netWorth,
    thisMonth: { income, expense, net: income - expense },
    topCategory: topCategoryId ? { id: topCategoryId, name: catMap[topCategoryId]?.name, amount: spendByCat[topCategoryId] } : null,
    budgets: budgets.map((b) => ({
      ...b,
      limit: num(b.limit),
      spent: spendByCat[b.categoryId] ?? 0,
    })),
    recent: recent.map((t) => ({ ...t, amount: num(t.amount) })),
  });
}
