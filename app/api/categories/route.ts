import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const rows = await prisma.category.findMany({ where: { userId: user.id } });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const { name, icon, color, key } = await req.json();
  if (!name || !key) {
    return NextResponse.json({ error: "name and key are required" }, { status: 400 });
  }
  const created = await prisma.category.create({
    data: { userId: user.id, name, key, icon: icon ?? null, color: color ?? null, isDefault: false },
  });
  return NextResponse.json(created, { status: 201 });
}
