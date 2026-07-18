import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const rows = await prisma.goal.findMany({ where: { userId: user.id } });
  return NextResponse.json(
    rows.map((g) => ({ ...g, targetAmount: num(g.targetAmount), currentAmount: num(g.currentAmount) }))
  );
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const { name, targetAmount, currentAmount, deadline } = await req.json();
  if (!name || targetAmount == null) {
    return NextResponse.json({ error: "name and targetAmount are required" }, { status: 400 });
  }
  const created = await prisma.goal.create({
    data: {
      userId: user.id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline: deadline ? new Date(deadline) : null,
    },
  });
  return NextResponse.json(
    { ...created, targetAmount: num(created.targetAmount), currentAmount: num(created.currentAmount) },
    { status: 201 }
  );
}
