import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = { title: "Terms of Service — Finboard" };

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-muted hover:text-ink">Home</Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="display text-4xl text-ink">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {new Date().getFullYear()}</p>
        <div className="mt-8 space-y-6 text-[0.95rem] leading-relaxed text-muted">
          <section>
            <h2 className="text-lg font-bold text-ink">Acceptance</h2>
            <p>By using Finboard you agree to these terms. If you don&apos;t agree, please don&apos;t use the service.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">Not financial advice</h2>
            <p>Finboard is a tracking tool. Nothing here is financial, tax or investment advice.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">Your responsibility</h2>
            <p>You are responsible for the accuracy of the data you enter and for keeping your credentials safe.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">Changes</h2>
            <p>We may update these terms; continued use after changes means you accept the new terms.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
