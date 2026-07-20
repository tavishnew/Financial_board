"use client";

import { useEffect, useRef, useState } from "react";
import type { Quote } from "./provider";

export type QuoteStatus = "idle" | "loading" | "ready" | "error";

const HISTORY_CAP = 32;

interface UseLiveQuotesResult {
  quotes: Record<string, Quote>;
  history: Record<string, number[]>;
  status: QuoteStatus;
  lastUpdated: number | null;
  provider: string;
  refresh: () => void;
}

/**
 * Polls /api/stocks/quotes for the given symbols on an interval (default 3s,
 * inside the required 2-5s window) and keeps a short price history per symbol
 * for sparklines. Pure client-side; the provider used by the API is irrelevant
 * here, so the UI is identical for Mock vs Finnhub.
 */
export function useLiveQuotes(symbols: string[], enabled = true, intervalMs = 3000): UseLiveQuotesResult {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [history, setHistory] = useState<Record<string, number[]>>({});
  const [status, setStatus] = useState<QuoteStatus>("idle");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [provider, setProvider] = useState("");

  const key = symbols.join(",");
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    if (!enabled || symbols.length === 0) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    const controller = new AbortController();

    async function fetchOnce() {
      try {
        const res = await fetch(`/api/stocks/quotes?symbols=${encodeURIComponent(keyRef.current)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`quotes ${res.status}`);
        const data = (await res.json()) as { quotes: Record<string, Quote>; provider?: string };
        if (cancelled) return;
        const next = data.quotes ?? {};
        if (data.provider) setProvider(data.provider);
        setQuotes(next);
        setHistory((prev) => {
          const merged: Record<string, number[]> = { ...prev };
          for (const sym of Object.keys(next)) {
            const price = next[sym].price;
            const arr = merged[sym] ? [...merged[sym], price] : [price];
            if (arr.length > HISTORY_CAP) arr.shift();
            merged[sym] = arr;
          }
          return merged;
        });
        setLastUpdated(Date.now());
        setStatus((s) => (s === "idle" ? "ready" : s));
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) return;
        setStatus((s) => (s === "ready" ? "ready" : "error"));
      }
    }

    setStatus((s) => (s === "ready" ? s : "loading"));
    fetchOnce();
    const id = setInterval(fetchOnce, intervalMs);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key, intervalMs, tick]);

  return { quotes, history, status, lastUpdated, provider, refresh: () => setTick((t) => t + 1) };
}
