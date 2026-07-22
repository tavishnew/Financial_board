"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/Button";

export default function LandingHeader() {
  // Visible by default. Slides away when the user scrolls down, and eases back
  // into view on scroll-up, when near the top, or when hovered.
  const [visible, setVisible] = useState(true);
  const [hovering, setHovering] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= 24) {
        setVisible(true);
      } else if (y > lastY.current) {
        setVisible(false);
      } else if (y < lastY.current) {
        setVisible(true);
      }
      lastY.current = y;
    };
    const onMove = (e: MouseEvent) => {
      // Reveal when the pointer nears the top edge of the viewport.
      if (e.clientY <= 88) setVisible(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const shown = visible || hovering;

  return (
    <header
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={
        "fixed inset-x-0 top-0 z-50 transition-[transform,opacity] duration-500 ease-in will-change-transform " +
        (shown
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
