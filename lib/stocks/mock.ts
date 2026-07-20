import type { Quote, QuoteProvider } from "./provider";

// A seeded, plausible base price for well-known tickers. Anything not listed
// gets a deterministic pseudo-random base derived from the symbol so the demo
// still "works" for arbitrary tickers the user adds.
const BASE_PRICES: Record<string, number> = {
  AAPL: 192.4,
  MSFT: 421.8,
  NVDA: 124.6,
  TSLA: 248.3,
  GOOGL: 178.2,
  AMZN: 186.5,
  META: 504.1,
  NFLX: 642.0,
  AMD: 158.7,
  INTC: 31.2,
  SPY: 548.0,
  QQQ: 478.5,
  RELIANCE: 2950.0,
  TCS: 4120.0,
  INFY: 1780.0,
};

const VOLATILITY: Record<string, number> = {
  TSLA: 0.012,
  NVDA: 0.01,
  AMD: 0.009,
  NFLX: 0.008,
};

function basePriceFor(symbol: string): number {
  const known = BASE_PRICES[symbol];
  if (known) return known;
  // Deterministic base in a friendly range for unknown symbols.
  let h = 0;
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) >>> 0;
  return 20 + (h % 480);
}

function volatilityFor(symbol: string): number {
  return VOLATILITY[symbol] ?? 0.004;
}

interface MockState {
  price: number;
  prevClose: number;
}

// Singleton kept on globalThis so the simulated market survives across requests
// and hot-reloads in dev (one continuous random walk per server process).
const registry = (globalThis as unknown as { __mockQuotes?: Map<string, MockState> })
  .__mockQuotes ?? new Map<string, MockState>();
(globalThis as unknown as { __mockQuotes?: Map<string, MockState> }).__mockQuotes = registry;

function ensureState(symbol: string): MockState {
  let s = registry.get(symbol);
  if (!s) {
    const base = basePriceFor(symbol);
    s = { price: base, prevClose: base };
    registry.set(symbol, s);
  }
  return s;
}

// Advance one bounded random-walk tick. Called once per getQuotes request,
// which — combined with client polling every ~3s — produces visible "live"
// movement without needing a server-side timer.
function tick(state: MockState, vol: number): void {
  const drift = (Math.random() * 2 - 1) * vol;
  let next = state.price * (1 + drift);
  // Bounded: keep within +/-50% of the opening price.
  const floor = state.prevClose * 0.5;
  const ceil = state.prevClose * 1.5;
  next = Math.min(ceil, Math.max(floor, next));
  state.price = Math.round(next * 100) / 100;
}

export class MockQuoteProvider implements QuoteProvider {
  readonly name = "Simulated";

  async getQuotes(symbols: string[]): Promise<Record<string, Quote>> {
    const out: Record<string, Quote> = {};
    for (const raw of symbols) {
      const symbol = raw.trim().toUpperCase();
      if (!symbol) continue;
      const state = ensureState(symbol);
      tick(state, volatilityFor(symbol));
      const change = Math.round((state.price - state.prevClose) * 100) / 100;
      const changePct =
        state.prevClose === 0 ? 0 : Math.round((change / state.prevClose) * 10000) / 100;
      out[symbol] = {
        symbol,
        price: state.price,
        prevClose: state.prevClose,
        change,
        changePct,
        currency: "USD",
        updatedAt: Date.now(),
      };
    }
    return out;
  }
}

export const mockQuoteProvider = new MockQuoteProvider();
