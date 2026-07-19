import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const { currency } = await req.json();
  if (!currency || typeof currency !== "string") {
    return NextResponse.json({ error: "currency is required" }, { status: 400 });
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { currency },
  });
  return NextResponse.json({ id: updated.id, currency: updated.currency });
}
