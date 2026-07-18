import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const rows = await prisma.budget.findMany({ where: { userId: user.id } });
  return NextResponse.json(rows.map((b) => ({ ...b, limit: num(b.limit) })));
}

// Upsert by categoryId for the current user.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const { categoryId, limit } = await req.json();
  if (!categoryId || limit == null) {
    return NextResponse.json({ error: "categoryId and limit are required" }, { status: 400 });
  }
  const existing = await prisma.budget.findFirst({ where: { userId: user.id, categoryId } });
  const saved = existing
    ? await prisma.budget.update({ where: { id: existing.id }, data: { limit: Number(limit) } })
    : await prisma.budget.create({ data: { userId: user.id, categoryId, limit: Number(limit) } });
  return NextResponse.json({ ...saved, limit: num(saved.limit) }, { status: existing ? 200 : 201 });
}
