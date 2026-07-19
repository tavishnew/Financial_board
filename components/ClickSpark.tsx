"use client";

import * as React from "react";

type EasingFn = (t: number) => number;

const EASINGS: Record<string, EasingFn> = {
  linear: (t) => t,
  ease: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  "ease-in": (t) => t * t,
  "ease-out": (t) => 1 - Math.pow(1 - t, 2),
  "ease-in-out": (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
};

export interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: keyof typeof EASINGS | string;
  extraScale?: number;
  className?: string;
  children?: React.ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
  color: string;
  size: number;
  velocity: number;
}

export default function ClickSpark({
  sparkColor = "#ffffff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1,
  className,
  children,
}: ClickSparkProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sparksRef = React.useRef<Spark[]>([]);
  const easeRef = React.useRef<EasingFn>(EASINGS["ease-out"]);
  const rafRef = React.useRef<number>(0);
  const runningRef = React.useRef(false);

  React.useEffect(() => {
    easeRef.current = EASINGS[easing as string] ?? EASINGS["ease-out"];
  }, [easing]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const ease = easeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparksRef.current = sparksRef.current.filter((s) => {
        const p = (now - s.startTime) / duration;
        if (p >= 1) return false;
        const eased = ease(p);
        const dist = s.velocity * sparkRadius * 3 * eased;
        const cx = s.x + Math.cos(s.angle) * dist;
        const cy = s.y + Math.sin(s.angle) * dist;
        const scale = extraScale * (0.4 + eased * 0.8);
        const size = s.size * scale;
        ctx.globalAlpha = 1 - p;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0.1, size / 2), 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
      if (sparksRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        runningRef.current = false;
      }
    };

    const startLoop = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(draw);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reduced) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.6;
        sparksRef.current.push({
          x,
          y,
          angle,
          startTime: performance.now(),
          color: sparkColor,
          size: sparkSize * (0.6 + Math.random() * 0.4),
          velocity: 0.6 + Math.random() * 0.6,
        });
      }
      startLoop();
    };

    container.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointerdown", onPointerDown);
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, extraScale]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", minHeight: "100vh" }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      {children}
    </div>
  );
}
