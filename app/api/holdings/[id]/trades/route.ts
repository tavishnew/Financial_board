import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";

export const dynamic = "force-dynamic";

// Log a buy/sell against an existing holding. Recalculates shares + average
// cost, and deletes the holding entirely if a sell drains it to zero.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);

  const holding = await prisma.holding.findFirst({ where: { id: params.id, userId: user.id } });
  if (!holding) return NextResponse.json({ error: "Holding not found" }, { status: 404 });

  const body = await _req.json().catch(() => null);
  const type = body?.type === "sell" ? "sell" : "buy";
  const shares = Number(body?.shares);
  const price = Number(body?.price);
  const note = typeof body?.note === "string" ? body.note.trim() : null;

  if (!Number.isFinite(shares) || shares <= 0 || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "shares (>0) and price (>=0) are required" }, { status: 400 });
  }

  const currentShares = num(holding.shares);
  const currentAvg = num(holding.avgCost);

  if (type === "sell" && shares > currentShares + 1e-9) {
    return NextResponse.json({ error: "Cannot sell more shares than you hold" }, { status: 400 });
  }

  await prisma.trade.create({
    data: {
      userId: user.id,
      holdingId: holding.id,
      symbol: holding.symbol,
      type,
      shares,
      price,
      note: note || null,
      date: new Date(),
    },
  });

  // Sold everything -> close the position.
  if (type === "sell" && Math.abs(shares - currentShares) < 1e-9) {
    await prisma.holding.delete({ where: { id: holding.id } });
    return NextResponse.json({ deleted: true, symbol: holding.symbol });
  }

  let nextShares: number;
  let nextAvg: number;
  if (type === "buy") {
    nextShares = currentShares + shares;
    nextAvg = (currentShares * currentAvg + shares * price) / nextShares;
  } else {
    nextShares = currentShares - shares;
    nextAvg = currentAvg; // cost basis unchanged on a sell
  }

  const updated = await prisma.holding.update({
    where: { id: holding.id },
    data: { shares: nextShares, avgCost: nextAvg },
  });
  return NextResponse.json({ ...updated, shares: num(updated.shares), avgCost: num(updated.avgCost) });
}
