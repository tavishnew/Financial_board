import { NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/session";
import { getQuoteProvider, getActiveProviderName } from "@/lib/stocks";

export const dynamic = "force-dynamic";

// Returns live quotes for the requested symbols. This route contains NO
// provider-specific logic — it simply asks the selected QuoteProvider. Swapping
// Mock for Finnhub (or any other provider) is invisible to this handler.
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized(NextResponse);

  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("symbols") ?? "";
  const symbols = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({ provider: getActiveProviderName(), quotes: {}, updatedAt: Date.now() });
  }

  const quotes = await getQuoteProvider().getQuotes(symbols);
  return NextResponse.json(
    { provider: getActiveProviderName(), quotes, updatedAt: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
