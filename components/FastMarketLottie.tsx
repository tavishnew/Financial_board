"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

// Renders the "Fast Market Access" Lottie composition. lottie-react's <Lottie>
// only accepts in-memory `animationData`, so we fetch the JSON (served from
// /public) client-side. This keeps the ~0.4MB payload out of the JS bundle
// and loads it lazily on the landing hero.
export function FastMarketLottie({ className }: { className?: string }) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/fast-market-access.json")
      .then((r) => r.json())
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!data) return null;
  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      className={className}
      rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
    />
  );
}
