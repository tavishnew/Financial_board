import type { QuoteProvider } from "./provider";
import { mockQuoteProvider } from "./mock";
import { FinnhubQuoteProvider } from "./finnhub";

// Single source of truth for "which market data source is active".
// The presence of STOCK_API_KEY flips the whole app to Finnhub with zero
// code changes elsewhere. To add Alpha Vantage / Polygon / Twelve Data /
// Yahoo, implement a class in this folder and select it here.
let resolved: QuoteProvider | null = null;

function resolve(): QuoteProvider {
  if (resolved) return resolved;
  const key = process.env.STOCK_API_KEY;
  resolved = key ? new FinnhubQuoteProvider(key) : mockQuoteProvider;
  return resolved;
}

export function getQuoteProvider(): QuoteProvider {
  return resolve();
}

/** Name of the active provider, surfaced to the UI as a "live source" badge. */
export function getActiveProviderName(): string {
  return resolve().name;
}

export type { Quote, QuoteProvider } from "./provider";
