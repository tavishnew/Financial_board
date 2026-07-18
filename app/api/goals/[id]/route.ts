import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const data = await req.json();
  const updated = await prisma.goal.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.targetAmount !== undefined ? { targetAmount: Number(data.targetAmount) } : {}),
      ...(data.currentAmount !== undefined ? { currentAmount: Number(data.currentAmount) } : {}),
      ...(data.deadline !== undefined ? { deadline: data.deadline ? new Date(data.deadline) : null } : {}),
    },
  });
  return NextResponse.json({
    ...updated,
    targetAmount: num(updated.targetAmount),
    currentAmount: num(updated.currentAmount),
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  await prisma.goal.deleteMany({ where: { id: params.id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
