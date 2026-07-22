"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Wallet, PiggyBank } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { cn } from "@/lib/cn";
import type { AccountType, CategoryKey } from "@/lib/types";

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];
const ACCOUNT_TYPES: { key: AccountType; label: string }[] = [
  { key: "bank", label: "Bank" },
  { key: "card", label: "Card" },
  { key: "cash", label: "Cash" },
  { key: "wallet", label: "Wallet" },
];

const STEPS = ["Currency", "Account", "Budgets"];

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const { setCurrency, addAccount, upsertBudget, categories } = useStore();
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();

  const [currency, setCurrencyState] = useState("INR");
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState<AccountType>("bank");
  const [accBalance, setAccBalance] = useState("50000");
  const [picked, setPicked] = useState<Record<string, string>>({
    food: "12000",
    transport: "5000",
    shopping: "9000",
  });

  function finish() {
    setCurrency(currency);
    addAccount({ name: accName || "My account", type: accType, balance: Number(accBalance) || 0, archived: false });
    Object.entries(picked).forEach(([key, limit]) => {
      const cat = categories.find((c) => c.key === (key as CategoryKey));
      if (cat && Number(limit) > 0) upsertBudget(cat.id, Number(limit));
    });
    toast("You're all set!", "success");
    router.push("/dashboard");
  }

  return (
    <div className="grain relative min-h-screen">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-primary/20 blur-[130px]" />
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-sm font-semibold text-muted hover:text-ink">
            Skip
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-xl px-6 py-8">
        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition-colors",
                  i <= step ? "bg-primary text-white" : "bg-surface-2 text-muted"
                )}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={cn("text-sm font-semibold", i <= step ? "text-ink" : "text-muted")}>{s}</span>
              {i < STEPS.length - 1 && <div className="h-0.5 flex-1 rounded-full bg-line" />}
            </div>
          ))}
        </div>

        <motion.div key={step} initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateX(20px)" }} animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateX(0px)" }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          {step === 0 && (
            <div>
              <h1 className="display text-3xl text-ink">Pick your currency</h1>
              <p className="mt-2 text-muted">We&apos;ll use this everywhere your money shows up.</p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrencyState(c)}
                    className={cn(
                      "rounded-2xl border py-4 text-lg font-bold transition-colors",
                      currency === c ? "border-primary bg-primary/10 text-primary" : "border-line text-ink hover:border-primary/50"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="display text-3xl text-ink">Add your first account</h1>
              <p className="mt-2 text-muted">A bank, card, cash stash — whatever you track.</p>
              <div className="mt-6 space-y-4">
                <input
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Account name"
                  className="h-12 w-full rounded-2xl border border-line bg-surface-2 px-4 text-ink outline-none focus:border-primary"
                />
                <div className="grid grid-cols-4 gap-2">
                  {ACCOUNT_TYPES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setAccType(t.key)}
                      className={cn(
                        "rounded-2xl border py-3 text-sm font-semibold transition-colors",
                        accType === t.key ? "border-primary bg-primary/10 text-primary" : "border-line text-ink hover:border-primary/50"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface-2 px-4">
                  <span className="text-lg font-bold text-muted">{currency === "INR" ? "₹" : "$"}</span>
                  <input
                    type="number"
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                    className="h-12 w-full bg-transparent text-lg font-bold tabnum text-ink outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="display text-3xl text-ink">Set a few budgets</h1>
              <p className="mt-2 text-muted">Start with what matters. You can change these anytime.</p>
              <div className="mt-6 space-y-3">
                {CATEGORY_ORDER.map((key) => {
                  const meta = CATEGORY_META[key];
                  const Icon = meta.icon;
                  const active = key in picked;
                  return (
                    <div key={key} className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3">
                      <button
                        onClick={() =>
                          setPicked((p) => {
                            const next = { ...p };
                            if (active) delete next[key];
                            else next[key] = "5000";
                            return next;
                          })
                        }
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-xl transition-colors",
                          active ? "text-white" : "bg-surface text-muted"
                        )}
                        style={active ? { background: meta.hue } : undefined}
                        aria-label={`Toggle ${meta.name}`}
                      >
                        {active ? <Check size={16} /> : <Icon size={16} strokeWidth={2.4} />}
                      </button>
                      <span className="font-semibold text-ink">{meta.name}</span>
                      {active && (
                        <div className="ml-auto flex items-center gap-1 rounded-xl bg-surface px-3">
                          <span className="text-muted">{currency === "INR" ? "₹" : "$"}</span>
                          <input
                            type="number"
                            value={picked[key]}
                            onChange={(e) => setPicked((p) => ({ ...p, [key]: e.target.value }))}
                            className="h-9 w-24 bg-transparent text-right font-bold tabnum text-ink outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="soft" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button className="flex-1" onClick={finish}>
              <PiggyBank size={18} /> Finish setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

