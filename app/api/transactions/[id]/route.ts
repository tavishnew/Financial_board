import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, num } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);

  const txn = await prisma.transaction.findFirst({ where: { id: params.id, userId: user.id } });
  if (!txn) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.transaction.delete({ where: { id: params.id } }),
    prisma.account.update({
      where: { id: txn.accountId },
      data: { balance: { increment: txn.type === "income" ? -num(txn.amount) : num(txn.amount) } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
