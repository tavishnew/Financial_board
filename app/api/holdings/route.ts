import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const rows = await prisma.holding.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(rows.map((h) => ({ ...h, shares: num(h.shares), avgCost: num(h.avgCost) })));
}

// Create a holding and record the opening buy as a Trade.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);

  const body = await req.json().catch(() => null);
  const symbol = (body?.symbol ?? "").toString().trim().toUpperCase();
  const name = (body?.name ?? "").toString().trim();
  const shares = Number(body?.shares);
  const avgCost = Number(body?.avgCost);

  if (!symbol || !name || !Number.isFinite(shares) || shares <= 0 || !Number.isFinite(avgCost) || avgCost < 0) {
    return NextResponse.json(
      { error: "symbol, name, shares (>0) and avgCost (>=0) are required" },
      { status: 400 }
    );
  }

  const created = await prisma.holding.create({
    data: { userId: user.id, symbol, name, shares, avgCost },
  });

  await prisma.trade.create({
    data: {
      userId: user.id,
      holdingId: created.id,
      symbol,
      type: "buy",
      shares,
      price: avgCost,
      note: "Opening position",
      date: new Date(),
    },
  });

  return NextResponse.json(
    { ...created, shares: num(created.shares), avgCost: num(created.avgCost) },
    { status: 201 }
  );
}
