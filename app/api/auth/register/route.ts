import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

// Default categories seeded for every new user
const DEFAULT_CATEGORIES = [
  { key: "food", name: "Food" },
  { key: "transport", name: "Transport" },
  { key: "shopping", name: "Shopping" },
  { key: "bills", name: "Bills" },
  { key: "fun", name: "Fun" },
  { key: "health", name: "Health" },
  { key: "savings", name: "Savings" },
] as const;

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Rate limiting by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    ?? req.headers.get("x-real-ip") 
    ?? "unknown";
  const { allowed, remaining, resetAt } = rateLimit(ip);
  
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": Math.ceil((resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    // Normalized error: same 400 for both validation errors and existing email
    return NextResponse.json(
      { error: "Invalid input. Please check your details." },
      { 
        status: 400,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      }
    );
  }
  
  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  
  // Normalized error: same 400 response whether email exists or not
  if (existing) {
    return NextResponse.json(
      { error: "Invalid input. Please check your details." },
      { 
        status: 400,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      }
    );
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      categories: {
        create: DEFAULT_CATEGORIES.map((c) => ({ key: c.key, name: c.name, isDefault: true })),
      },
    },
  });
  
  return NextResponse.json(
    { id: user.id, email: user.email }, 
    { 
      status: 201,
      headers: { "X-RateLimit-Remaining": remaining.toString() },
    }
  );
}