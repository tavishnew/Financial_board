import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  
  // Check if user already has categories
  const existing = await prisma.category.findFirst({ where: { userId: user.id } });
  if (existing) return NextResponse.json({ seeded: false, reason: "already has categories" });

  const DEFAULT_CATEGORIES = [
    { key: "food", name: "Food" },
    { key: "transport", name: "Transport" },
    { key: "shopping", name: "Shopping" },
    { key: "bills", name: "Bills" },
    { key: "fun", name: "Fun" },
    { key: "health", name: "Health" },
    { key: "savings", name: "Savings" },
  ];

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map(c => ({ userId: user.id, key: c.key, name: c.name, isDefault: true })),
  });

  return NextResponse.json({ seeded: true, categories: DEFAULT_CATEGORIES.length });
}