import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how MoneyTrail handles your financial data. We never sell your data and provide full control to export or delete your records at any time.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Logo clickable />
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-muted hover:text-ink">Home</Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="display text-4xl text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {new Date().getFullYear()}</p>
        <div className="prose-fin mt-8 space-y-6 text-[0.95rem] leading-relaxed text-muted">
          <section>
            <h2 className="text-lg font-bold text-ink">What we collect</h2>
            <p>
              MoneyTrail stores the accounts, transactions, budgets and goals you
              create, tied to your account. We do not sell your financial data,
              ever.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">How it&apos;s used</h2>
            <p>
              Your data is used only to render your dashboard, charts and alerts.
              Aggregated, anonymized usage may help us improve the product.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">Your controls</h2>
            <p>
              You can export or delete all of your data from Settings at any time.
              Deletion is permanent and removes your records from our systems.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">Contact</h2>
            <p>Questions? Reach us at privacy@MoneyTrail.app.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
