import type { Holding } from "@/lib/types";
import type { Quote } from "./provider";

export interface ValuedHolding {
  holding: Holding;
  quote?: Quote;
  marketValue: number;
  costBasis: number;
  gain: number;
  gainPct: number;
  dayChange: number;
  /** Share of total portfolio market value, 0-100. */
  allocationPct: number;
  /** Day change % from the live quote (fallback to gainPct if no quote). */
  dayChangePct: number;
}

export interface PortfolioSummary {
  marketValue: number;
  costBasis: number;
  gain: number;
  gainPct: number;
  dayChange: number;
  dayChangePct: number;
  items: ValuedHolding[];
  gainers: ValuedHolding[];
  losers: ValuedHolding[];
}

function round(n: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export function valuePortfolio(holdings: Holding[], quotes: Record<string, Quote>): PortfolioSummary {
  const items: ValuedHolding[] = holdings.map((holding) => {
    const q = quotes[holding.symbol.toUpperCase()];
    const shares = holding.shares;
    const marketValue = q ? round(shares * q.price) : 0;
    const costBasis = round(shares * holding.avgCost);
    const gain = round(marketValue - costBasis);
    const gainPct = costBasis === 0 ? 0 : round((gain / costBasis) * 100, 2);
    const dayChange = q ? round(shares * (q.price - q.prevClose)) : 0;
    const dayChangePct = q ? q.changePct : gainPct;
    return {
      holding,
      quote: q,
      marketValue,
      costBasis,
      gain,
      gainPct,
      dayChange,
      dayChangePct,
      allocationPct: 0,
      // allocation filled below once we know the total
    };
  });

  const marketValue = round(items.reduce((s, i) => s + i.marketValue, 0));
  const costBasis = round(items.reduce((s, i) => s + i.costBasis, 0));
  const gain = round(marketValue - costBasis);
  const gainPct = costBasis === 0 ? 0 : round((gain / costBasis) * 100, 2);
  const dayChange = round(items.reduce((s, i) => s + i.dayChange, 0));
  const prevValue = marketValue - dayChange;
  const dayChangePct = prevValue === 0 ? 0 : round((dayChange / prevValue) * 100, 2);

  for (const i of items) {
    i.allocationPct = marketValue === 0 ? 0 : round((i.marketValue / marketValue) * 100, 1);
  }

  // Top movers ranked by the day's % move (quote.changePct), ignoring
  // holdings that have no live quote yet.
  const withQuotes = items.filter((i) => i.quote);
  const byDay = [...withQuotes].sort((a, b) => b.dayChangePct - a.dayChangePct);
  const gainers = byDay.filter((i) => i.dayChangePct >= 0).slice(0, 3);
  const losers = byDay
    .filter((i) => i.dayChangePct < 0)
    .slice(-3)
    .reverse();

  return {
    marketValue,
    costBasis,
    gain,
    gainPct,
    dayChange,
    dayChangePct,
    items,
    gainers,
    losers,
  };
}
