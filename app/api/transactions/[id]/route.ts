import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);

  const txn = await prisma.transaction.findFirst({ where: { id: params.id, userId: user.id } });
  if (!txn) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Balance is updated optimistically in the client store (store.tsx deleteTransaction)
  // Do NOT update here to avoid double-counting.
  await prisma.transaction.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}