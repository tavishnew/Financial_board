"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/Button";

export default function LandingHeader() {
  // Hidden by default; revealed only when the pointer nears the top edge of the
  // viewport (or hovers the bar itself), then smoothly slides away.
  const [nearTop, setNearTop] = useState(false);
  const [hovering, setHovering] = useState(false);
  const visible = nearTop || hovering;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setNearTop(e.clientY <= 88);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <header
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={
        "fixed inset-x-0 top-0 z-50 transition-[transform,opacity] duration-500 ease-out-quint will-change-transform " +
        (visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none")
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 border-b border-line/60 bg-bg/70 px-5 py-4 backdrop-blur-md">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-muted md:flex">
          <a href="#features" className="transition-colors hover:text-ink">Features</a>
          <a href="#preview" className="transition-colors hover:text-ink">Preview</a>
          <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
