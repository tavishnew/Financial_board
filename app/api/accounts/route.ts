import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const rows = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(rows.map((a) => ({ ...a, balance: num(a.balance) })));
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const { name, type, balance } = await req.json();
  if (!name || !type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }
  const created = await prisma.account.create({
    data: { userId: user.id, name, type, balance: Number(balance) || 0 },
  });
  return NextResponse.json({ ...created, balance: num(created.balance) }, { status: 201 });
}
