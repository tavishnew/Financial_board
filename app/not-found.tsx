import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="grain relative grid min-h-screen place-items-center overflow-hidden px-6">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[130px]" />
      <div className="relative z-10 text-center">
        <Logo />
        <h1 className="display mt-8 text-[clamp(4rem,16vw,9rem)] text-ink">404</h1>
        <p className="mt-2 text-lg text-muted">This page wandered off the budget.</p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button size="lg">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
