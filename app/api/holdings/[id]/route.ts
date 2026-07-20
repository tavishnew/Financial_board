import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);

  const existing = await prisma.holding.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Holding not found" }, { status: 404 });

  const body = await _req.json().catch(() => null);

  const data: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body?.symbol === "string" && body.symbol.trim())
    data.symbol = body.symbol.trim().toUpperCase();
  if (body?.shares != null) {
    const shares = Number(body.shares);
    if (!Number.isFinite(shares) || shares < 0) {
      return NextResponse.json({ error: "shares must be >= 0" }, { status: 400 });
    }
    data.shares = shares;
  }
  if (body?.avgCost != null) {
    const avgCost = Number(body.avgCost);
    if (!Number.isFinite(avgCost) || avgCost < 0) {
      return NextResponse.json({ error: "avgCost must be >= 0" }, { status: 400 });
    }
    data.avgCost = avgCost;
  }

  const updated = await prisma.holding.update({ where: { id: params.id }, data });
  return NextResponse.json({ ...updated, shares: num(updated.shares), avgCost: num(updated.avgCost) });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);

  const existing = await prisma.holding.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Holding not found" }, { status: 404 });

  // Trades cascade via onDelete: Cascade.
  await prisma.holding.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
