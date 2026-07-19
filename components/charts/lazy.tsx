"use client";

import dynamic from "next/dynamic";

// recharts (and its d3 dependency) is the heaviest part of the client bundle.
// Load the chart widgets lazily so they become a separate async chunk that
// pops in after first paint instead of blocking initial load.
const skeleton = (height: string) => (
  <div className="w-full animate-pulse rounded-2xl bg-surface-2" style={{ height }} />
);

export const CategoryPie = dynamic(
  () => import("./CategoryPie").then((m) => m.CategoryPie),
  { ssr: false, loading: () => skeleton("11rem") }
);

export const MiniTrend = dynamic(
  () => import("./MiniTrend").then((m) => m.MiniTrend),
  { ssr: false, loading: () => skeleton("7.5rem") }
);

export const CompareBar = dynamic(
  () => import("./CompareBar").then((m) => m.CompareBar),
  { ssr: false, loading: () => skeleton("16rem") }
);

export const TrendArea = dynamic(
  () => import("./TrendArea").then((m) => m.TrendArea),
  { ssr: false, loading: () => skeleton("13.75rem") }
);
