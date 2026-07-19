import { describe, it, expect, afterAll } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";

function makeReq(body: unknown) {
  return POST(
    new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as unknown as Request
  );
}

describe("POST /api/auth/register", () => {
  const email = `reg-${Date.now()}@finboard.app`;

  it("creates a user with a bcrypt hash", async () => {
    const res = await makeReq({ name: "T", email, password: "password123" });
    expect(res.status).toBe(201);
    const u = await prisma.user.findUnique({ where: { email } });
    expect(u).toBeTruthy();
    expect(u!.passwordHash).not.toBe("password123");
  });

  it("rejects duplicate email with 409", async () => {
    const res = await makeReq({ name: "T", email, password: "password123" });
    expect(res.status).toBe(409);
  });

  it("rejects invalid body with 400", async () => {
    const res = await makeReq({ name: "", email: "bad", password: "1" });
    expect(res.status).toBe(400);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "reg-" } } });
    await prisma.$disconnect();
  });
});
