import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const data: Record<string, unknown> = {};
  if (typeof body.currency === "string" && body.currency) data.currency = body.currency;
  // Only persist local raster image data URLs, capped in size. No external
  // http(s) links and no SVG — keeps all avatar bytes on-device (local-first)
  // and avoids loading third-party images.
  const AVATAR_MAX = 2_500_000; // ~2 MB of base64
  if (
    typeof body.avatarUrl === "string" &&
    body.avatarUrl.length <= AVATAR_MAX &&
    /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(body.avatarUrl)
  ) {
    data.avatarUrl = body.avatarUrl;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({
    id: updated.id,
    currency: updated.currency,
    avatarUrl: updated.avatarUrl,
  });
}
