// Provider-agnostic quote abstraction.
//
// The app only ever talks to the `QuoteProvider` interface. Swapping data
// sources (Mock -> Finnhub -> Alpha Vantage, Polygon, Twelve Data, Yahoo...)
// requires implementing another class that satisfies this contract and
// registering it in `./index.ts`. No API route or UI code changes.

export interface Quote {
  symbol: string;
  price: number;
  /** Previous close, used to derive the day's change. */
  prevClose: number;
  change: number;
  changePct: number;
  currency: string;
  updatedAt: number;
}

export interface QuoteProvider {
  /** Human-readable name shown in the UI (e.g. "Simulated", "Finnhub"). */
  readonly name: string;
  /**
   * Fetch live quotes for the given symbols. Implementations must return a
   * record keyed by upper-cased symbol; missing/unavailable symbols may be
   * omitted. This call is the single seam between the app and the data source.
   */
  getQuotes(symbols: string[]): Promise<Record<string, Quote>>;
}
