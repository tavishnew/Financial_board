import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import type { NextResponse } from "next/server";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export function unauthorized(res: typeof NextResponse) {
  return res.json({ error: "Unauthorized" }, { status: 401 });
}

// Prisma returns Decimal; JSON can't serialize it, so convert to number.
export function num(value: { toNumber(): number } | number): number {
  return typeof value === "number" ? value : value.toNumber();
}
