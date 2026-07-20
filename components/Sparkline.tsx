"use client";

import { useId } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  hue?: string;
  className?: string;
}

// Lightweight inline-SVG sparkline (no recharts dependency). Auto-scales to the
// data range and draws a soft area fill. Falls back to a flat line when empty.
export function Sparkline({ data, width = 96, height = 32, hue = "var(--primary)", className }: SparklineProps) {
  const gradId = useId();
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className={className} aria-hidden="true">
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={hue} strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="3 3" />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = 2;
  const toY = (v: number) => height - pad - ((v - min) / range) * (height - pad * 2);

  const points = data.map((v, i) => [i * stepX, toY(v)] as const);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hue} stopOpacity={0.28} />
          <stop offset="100%" stopColor={hue} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={hue} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
