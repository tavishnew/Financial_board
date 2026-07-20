import type { Quote, QuoteProvider } from "./provider";

// Real provider: https://finnhub.io/docs/api/quote
// Activates automatically when STOCK_API_KEY is present (see ./index.ts).
export class FinnhubQuoteProvider implements QuoteProvider {
  readonly name = "Finnhub";
  private readonly token: string;
  private readonly base = "https://finnhub.io/api/v1/quote";

  constructor(token: string) {
    this.token = token;
  }

  async getQuotes(symbols: string[]): Promise<Record<string, Quote>> {
    const out: Record<string, Quote> = {};
    await Promise.all(
      symbols.map(async (raw) => {
        const symbol = raw.trim().toUpperCase();
        if (!symbol) return;
        try {
          const res = await fetch(`${this.base}?symbol=${encodeURIComponent(symbol)}&token=${this.token}`, {
            // Stock quotes are live data; never cache at the route layer.
            cache: "no-store",
          });
          if (!res.ok) return;
          const d = (await res.json()) as {
            c: number;
            pc: number;
            d: number | null;
            dp: number | null;
            t: number;
          };
          // Finnhub returns 0 for c when the symbol is unknown / market closed.
          if (!d || typeof d.c !== "number" || d.c === 0) return;
          out[symbol] = {
            symbol,
            price: d.c,
            prevClose: d.pc,
            change: d.d ?? 0,
            changePct: d.dp ?? 0,
            currency: "USD",
            updatedAt: (d.t ?? Math.floor(Date.now() / 1000)) * 1000,
          };
        } catch {
          // Per-symbol failure is non-fatal; other symbols still resolve.
        }
      })
    );
    return out;
  }
}
