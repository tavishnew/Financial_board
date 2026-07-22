"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  LineChart,
  RefreshCw,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useLiveQuotes } from "@/lib/stocks/useLiveQuotes";
import { valuePortfolio } from "@/lib/stocks/calc";
import type { Holding, TradeType } from "@/lib/types";
import { ProgressBar } from "@/components/ProgressBar";
import { CountUp } from "@/components/CountUp";
import { Sparkline } from "@/components/Sparkline";
import { EmptyState } from "@/components/EmptyState";
import clsx from "clsx";

// Distinct hues for allocation bars / sparklines, cycling per holding.
const HUES = [
  "var(--primary)",
  "var(--accent)",
  "oklch(0.78 0.17 145)",
  "oklch(0.72 0.16 60)",
  "oklch(0.65 0.16 250)",
  "oklch(0.62 0.20 300)",
  "oklch(0.68 0.18 350)",
  "oklch(0.72 0.14 195)",
];

const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const usd2 = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signedUSD = (n: number) =>
  (n < 0 ? "−" : n > 0 ? "+" : "") + "$" + Math.abs(Math.round(n)).toLocaleString("en-US");
const fmtShares = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 });

export function InvestmentsCard() {
  const { holdings, addHolding, deleteHolding, addTrade } = useStore();
  const reduce = useReducedMotion();

  const symbols = useMemo(() => holdings.map((h) => h.symbol.toUpperCase()), [holdings]);
  const { quotes, history, status, lastUpdated, provider, refresh } = useLiveQuotes(symbols);
  const summary = useMemo(() => valuePortfolio(holdings, quotes), [holdings, quotes]);

  const [addOpen, setAddOpen] = useState(false);
  const [tradeFor, setTradeFor] = useState<Holding | null>(null);

  const live = status === "ready";
  const connecting = status === "loading" && Object.keys(quotes).length === 0;

  return (
    <section className="card relative overflow-hidden p-6">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="kicker text-muted">Investments</span>
          <h3 className="display mt-0.5 text-2xl font-extrabold text-ink">Track your portfolio</h3>
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge provider={provider} status={status} live={live} connecting={connecting} onRetry={refresh} />
          <button
            onClick={() => setAddOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {status === "error" && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[color:var(--c-bills)]/30 bg-[color:var(--c-bills)]/10 px-3 py-2 text-sm text-[color:var(--c-bills)]">
          <Activity size={15} /> Live prices are unavailable right now. Showing your last values.
          <button onClick={refresh} className="ml-auto flex items-center gap-1 font-semibold underline">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {holdings.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title="No investments yet"
          description="Add a stock, ETF or fund to start tracking live prices, profit/loss and allocation — no API key required."
          action={
            <button
              onClick={() => setAddOpen(true)}
              className="mt-2 flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm shadow-primary/20"
            >
              <Plus size={16} /> Add your first investment
            </button>
          }
        />
      ) : (
        <>
          {/* Portfolio summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryTile
              label="Portfolio value"
              value={summary.marketValue}
              format={usd}
              hue="var(--primary)"
              hero
              icon={Wallet}
            />
            <SummaryTile
              label="Total gain / loss"
              value={summary.gain}
              format={signedUSD}
              delta={summary.gainPct}
              deltaLabel="all time"
              hue="var(--accent)"
              icon={TrendingUp}
            />
            <SummaryTile
              label="Day change"
              value={summary.dayChange}
              format={signedUSD}
              delta={summary.dayChangePct}
              deltaLabel="today"
              hue="oklch(0.78 0.17 145)"
              icon={Activity}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-12">
            {/* Holdings list */}
            <div className="lg:col-span-7">
              <div className="mb-2 flex items-center justify-between">
                <span className="kicker text-muted">Holdings · {holdings.length}</span>
                <span className="text-xs text-muted">Prices update live</span>
              </div>
              <div className="divide-y divide-line">
                {summary.items.map((item, i) => (
                  <HoldingRow
                    key={item.holding.id}
                    item={item}
                    hue={HUES[i % HUES.length]}
                    history={history[item.holding.symbol.toUpperCase()] ?? []}
                    onRemove={() => deleteHolding(item.holding.id)}
                    onTrade={() => setTradeFor((cur) => (cur?.id === item.holding.id ? null : item.holding))}
                    trading={tradeFor?.id === item.holding.id}
                    onTradeSubmit={(t) => addTrade(item.holding.id, t)}
                    onTradeCancel={() => setTradeFor(null)}
                    reduce={!!reduce}
                  />
                ))}
              </div>
            </div>

            {/* Allocation + movers */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl border border-line bg-surface-2/40 p-4">
                <span className="kicker text-muted">Allocation</span>
                <div className="mt-3 space-y-3">
                  {summary.items.map((item, i) => (
                    <div key={item.holding.id}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-ink">{item.holding.symbol}</span>
                        <span className="tabnum text-muted">{item.allocationPct}%</span>
                      </div>
                      <ProgressBar value={item.allocationPct} hue={HUES[i % HUES.length]} height={8} />
                    </div>
                  ))}
                </div>
              </div>

              <Movers gainers={summary.gainers} losers={summary.losers} />
            </div>
          </div>
        </>
      )}

      {addOpen && (
        <AddHoldingModal
          onClose={() => setAddOpen(false)}
          onSubmit={async (h) => {
            await addHolding(h);
            setAddOpen(false);
          }}
        />
      )}

      {lastUpdated && (
        <p className="mt-4 text-right text-[11px] text-muted">
          Updated {Math.max(0, Math.round((Date.now() - lastUpdated) / 1000))}s ago · {provider || "Market"}
        </p>
      )}
    </section>
  );
}

function SourceBadge({
  provider,
  status,
  live,
  connecting,
  onRetry,
}: {
  provider: string;
  status: string;
  live: boolean;
  connecting: boolean;
  onRetry: () => void;
}) {
  const isReal = provider === "Finnhub";
  const hue = isReal ? "var(--primary)" : "var(--accent)";
  if (status === "error") {
    return (
      <button
        onClick={onRetry}
        className="flex h-8 items-center gap-1.5 rounded-pill border border-[color:var(--c-bills)]/40 px-3 text-xs font-semibold text-[color:var(--c-bills)]"
      >
        <RefreshCw size={13} /> Retry
      </button>
    );
  }
  return (
    <span
      className="flex h-8 items-center gap-1.5 rounded-pill px-3 text-xs font-semibold"
      style={{ background: `color-mix(in oklch, ${hue} 14%, transparent)`, color: hue }}
      title={isReal ? "Live data via Finnhub" : "Simulated market data (no API key)"}
    >
      <span
        className={clsx("h-2 w-2 rounded-full", (live || connecting) && "animate-pulse")}
        style={{ background: hue }}
      />
      {connecting ? "Connecting" : isReal ? "Live · Finnhub" : "Simulated"}
    </span>
  );
}

function SummaryTile({
  label,
  value,
  format,
  delta,
  deltaLabel,
  hue,
  hero,
  icon: Icon,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  delta?: number;
  deltaLabel?: string;
  hue: string;
  hero?: boolean;
  icon: LucideIcon;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-line bg-surface-2/40 p-4">
      <div className="flex items-center justify-between">
        <span className="kicker text-muted">{label}</span>
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: `color-mix(in oklch, ${hue} 16%, transparent)`, color: hue }}
        >
          <Icon size={15} strokeWidth={2.4} />
        </span>
      </div>
      <div className={clsx("display tabnum mt-2 text-ink", hero ? "text-[clamp(1.7rem,3vw,2.25rem)]" : "text-2xl")}>
        <CountUp value={value} format={format} />
      </div>
      {delta !== undefined && (
        <div className="mt-1 flex items-center gap-1 text-sm">
          <span className={clsx("tabnum font-semibold", positive ? "text-primary" : "text-[color:var(--c-bills)]")}>
            {positive ? <ArrowUpRight size={14} className="inline" /> : <ArrowDownRight size={14} className="inline" />}{" "}
            {Math.abs(delta).toFixed(1)}%
          </span>
          {deltaLabel && <span className="text-muted">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

function HoldingRow({
  item,
  hue,
  history,
  onRemove,
  onTrade,
  trading,
  onTradeSubmit,
  onTradeCancel,
  reduce,
}: {
  item: ReturnType<typeof valuePortfolio>["items"][number];
  hue: string;
  history: number[];
  onRemove: () => void;
  onTrade: () => void;
  trading: boolean;
  onTradeSubmit: (t: { type: TradeType; shares: number; price: number; note?: string }) => void;
  onTradeCancel: () => void;
  reduce: boolean;
}) {
  const { holding, quote } = item;
  const up = (quote?.changePct ?? 0) >= 0;
  return (
    <div className="py-3">
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold"
          style={{ background: `color-mix(in oklch, ${hue} 16%, transparent)`, color: hue }}
        >
          {holding.symbol.slice(0, 3)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">{holding.symbol}</span>
            <span className="truncate text-xs text-muted">{holding.name}</span>
          </div>
          <div className="text-xs text-muted tabnum">
            {fmtShares(holding.shares)} sh · avg {usd2(holding.avgCost)}
          </div>
        </div>

        <div className="hidden text-right sm:block">
          <div className="display tabnum text-sm font-bold text-ink">
            {quote ? usd2(quote.price) : "—"}
          </div>
          <div className={clsx("tabnum text-xs font-semibold", up ? "text-primary" : "text-[color:var(--c-bills)]")}>
            {quote ? `${up ? "▲" : "▼"} ${Math.abs(quote.changePct).toFixed(2)}%` : ""}
          </div>
        </div>

        <div className="hidden w-24 text-right md:block">
          <Sparkline data={history} hue={hue} />
        </div>

        <div className="text-right">
          <div className="display tabnum text-sm font-bold text-ink">{usd(item.marketValue)}</div>
          <div className={clsx("tabnum text-xs font-semibold", item.gain >= 0 ? "text-primary" : "text-[color:var(--c-bills)]")}>
            {item.gain >= 0 ? "▲" : "▼"} {signedUSD(item.gain)}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onTrade}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-primary hover:text-primary"
            aria-label="Trade"
            title="Buy / sell"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onRemove}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-[color:var(--c-bills)] hover:text-[color:var(--c-bills)]"
            aria-label="Remove"
            title="Remove holding"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {trading && (
        <TradePanel
          holding={holding}
          price={quote?.price}
          onSubmit={onTradeSubmit}
          onCancel={onTradeCancel}
          reduce={reduce}
        />
      )}
    </div>
  );
}

function TradePanel({
  holding,
  price,
  onSubmit,
  onCancel,
  reduce,
}: {
  holding: Holding;
  price?: number;
  onSubmit: (t: { type: TradeType; shares: number; price: number; note?: string }) => void;
  onCancel: () => void;
  reduce: boolean;
}) {
  const [type, setType] = useState<TradeType>("buy");
  const [shares, setShares] = useState("");
  const [px, setPx] = useState(price ? String(price) : "");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (price != null) setPx(String(price));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  const valid = Number(shares) > 0 && Number(px) >= 0;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-3 overflow-hidden rounded-xl border border-line bg-surface-2/50 p-3"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex rounded-lg border border-line p-0.5">
          <button
            onClick={() => setType("buy")}
            className={clsx("rounded-md px-3 py-1 text-xs font-semibold", type === "buy" ? "bg-primary text-white" : "text-muted")}
          >
            Buy
          </button>
          <button
            onClick={() => setType("sell")}
            className={clsx("rounded-md px-3 py-1 text-xs font-semibold", type === "sell" ? "bg-[color:var(--c-bills)] text-white" : "text-muted")}
          >
            Sell
          </button>
        </div>
        <label className="flex flex-col text-xs text-muted">
          Shares
          <input
            className="input mt-1 h-9 w-24"
            inputMode="decimal"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="0"
          />
        </label>
        <label className="flex flex-col text-xs text-muted">
          Price
          <input
            className="input mt-1 h-9 w-28"
            inputMode="decimal"
            value={px}
            onChange={(e) => setPx(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label className="flex flex-1 flex-col text-xs text-muted">
          Note
          <input className="input mt-1 h-9" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
        </label>
        <button
          disabled={!valid}
          onClick={() => onSubmit({ type, shares: Number(shares), price: Number(px), note: note || undefined })}
          className="h-9 rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          Confirm {type}
        </button>
        <button onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted hover:text-ink">
          <X size={15} />
        </button>
      </div>
    </motion.div>
  );
}

function Movers({ gainers, losers }: { gainers: ReturnType<typeof valuePortfolio>["gainers"]; losers: ReturnType<typeof valuePortfolio>["losers"] }) {
  if (gainers.length === 0 && losers.length === 0) return null;
  return (
    <div className="rounded-2xl border border-line bg-surface-2/40 p-4">
      <span className="kicker text-muted">Top movers</span>
      <div className="mt-3 space-y-2">
        {gainers.map((g) => (
          <MoverRow key={g.holding.id} symbol={g.holding.symbol} pct={g.dayChangePct} dir="up" />
        ))}
        {losers.map((l) => (
          <MoverRow key={l.holding.id} symbol={l.holding.symbol} pct={l.dayChangePct} dir="down" />
        ))}
      </div>
    </div>
  );
}

function MoverRow({ symbol, pct, dir }: { symbol: string; pct: number; dir: "up" | "down" }) {
  const Icon = dir === "up" ? TrendingUp : TrendingDown;
  const color = dir === "up" ? "var(--primary)" : "var(--c-bills)";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 font-semibold text-ink">
        <Icon size={14} style={{ color }} /> {symbol}
      </span>
      <span className="tabnum font-semibold" style={{ color }}>
        {dir === "up" ? "+" : ""}
        {pct.toFixed(2)}%
      </span>
    </div>
  );
}

function AddHoldingModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (h: { symbol: string; name: string; shares: number; avgCost: number }) => Promise<void>;
}) {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [busy, setBusy] = useState(false);

  const valid = symbol.trim() && name.trim() && Number(shares) > 0 && Number(avgCost) >= 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-card-hover"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">Add investment</h3>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col text-xs text-muted">
              Symbol
              <input
                className="input mt-1 h-10"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
              />
            </label>
            <label className="flex flex-col text-xs text-muted">
              Avg cost (USD)
              <input
                className="input mt-1 h-10"
                inputMode="decimal"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                placeholder="175.20"
              />
            </label>
          </div>
          <label className="flex flex-col text-xs text-muted">
            Name
            <input
              className="input mt-1 h-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Apple Inc."
            />
          </label>
          <label className="flex flex-col text-xs text-muted">
            Shares
            <input
              className="input mt-1 h-10"
              inputMode="decimal"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="10"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="h-10 rounded-xl border border-line px-4 text-sm font-semibold text-muted hover:text-ink">
            Cancel
          </button>
          <button
            disabled={!valid || busy}
            onClick={async () => {
              if (!valid) return;
              setBusy(true);
              await onSubmit({
                symbol: symbol.trim().toUpperCase(),
                name: name.trim(),
                shares: Number(shares),
                avgCost: Number(avgCost),
              });
            }}
            className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-40"
          >
            Add holding
          </button>
        </div>
      </motion.div>
    </div>
  );
}
