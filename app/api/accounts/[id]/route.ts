import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const account = await prisma.account.findFirst({ where: { id: params.id, userId: user.id } });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await req.json();
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.type !== undefined) update.type = data.type;
  if (data.balance !== undefined) update.balance = Number(data.balance);
  if (data.archived !== undefined) update.archived = Boolean(data.archived);

  const updated = await prisma.account.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ ...updated, balance: num(updated.balance) });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  await prisma.account.deleteMany({ where: { id: params.id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
