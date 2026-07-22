import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");
  const accountId = searchParams.get("accountId");
  const q = searchParams.get("q");
  const limit = Number(searchParams.get("limit") ?? "100");

  const where: Prisma.TransactionWhereInput = { userId: user.id };
  if (type === "income" || type === "expense") where.type = type;
  if (categoryId) where.categoryId = categoryId;
  if (accountId) where.accountId = accountId;
  if (q) where.note = { contains: q, mode: "insensitive" };

  const rows = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(rows.map((t) => ({ ...t, amount: num(t.amount) })));
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);

  const body = await req.json();
  const { type, amount, categoryId, accountId, note, date, tags } = body;
  if (!type || !amount || !accountId) {
    return NextResponse.json({ error: "type, amount and accountId are required" }, { status: 400 });
  }

  const account = await prisma.account.findFirst({ where: { id: accountId, userId: user.id } });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const created = await prisma.transaction.create({
    data: {
      userId: user.id,
      type,
      amount: Number(amount),
      categoryId: type === "income" ? null : categoryId ?? null,
      accountId,
      note: note ?? null,
      tags: Array.isArray(tags) ? tags : [],
      date: date ? new Date(date) : new Date(),
    },
  });

  // Balance is updated optimistically in the client store (store.tsx addTransaction)
  // Do NOT update here to avoid double-counting.

  return NextResponse.json({ ...created, amount: num(created.amount) }, { status: 201 });
}