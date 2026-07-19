"use client";

import { useState } from "react";
import { Plus, Sun, Moon, Bell, Download, Trash2, Check, User, Shield, CreditCard, Sparkles, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useStore } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/Toast";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { cn } from "@/lib/cn";
import type { CategoryKey } from "@/lib/types";

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

export default function SettingsPage() {
  const { user, categories, setCurrency, addCategory, deleteCategory } = useStore();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [newCatName, setNewCatName] = useState("");
  const [newCatStyle, setNewCatStyle] = useState<CategoryKey>("shopping");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notif, setNotif] = useState({ overspend: true, billDue: true, weekly: false });
  const [currentTab, setCurrentTab] = useState<"general" | "categories" | "accounts">("general");

  function exportData() {
    const blob = new Blob([JSON.stringify({ user, categories }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MoneyTrail-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported all workspace data successfully", "success");
  }

  function addCat() {
    if (!newCatName.trim()) return;
    addCategory(newCatStyle, newCatName.trim());
    setNewCatName("");
    toast("Category registered successfully", "success");
  }

  return (
    <AppShell>
      {/* Title block */}
      <div className="mb-6 border-b border-line pb-6">
        <div className="kicker text-primary font-semibold">Workspace Configuration</div>
        <h1 className="display text-3xl text-ink font-bold">Workspace settings</h1>
        <p className="text-muted text-sm mt-1">Manage profile information, appearance settings, connected accounts, and categories.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-line mb-6 gap-6">
        <button
          onClick={() => setCurrentTab("general")}
          className={cn(
            "pb-3 text-sm font-bold border-b-2 transition-colors",
            currentTab === "general" ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
          )}
        >
          General &amp; Profile
        </button>
        <button
          onClick={() => setCurrentTab("categories")}
          className={cn(
            "pb-3 text-sm font-bold border-b-2 transition-colors",
            currentTab === "categories" ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
          )}
        >
          Custom Categories
        </button>
        <button
          onClick={() => setCurrentTab("accounts")}
          className={cn(
            "pb-3 text-sm font-bold border-b-2 transition-colors",
            currentTab === "accounts" ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
          )}
        >
          Connected Accounts
        </button>
      </div>

      <div className="space-y-6">
        {currentTab === "general" && (
          <>
            {/* Profile Settings */}
            <Section title="Profile settings" desc="Verify and adjust your personal user metadata.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
                </Field>
                <Field label="Email Address">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
                </Field>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary text-lg font-bold">
                  {name.charAt(0).toUpperCase()}
                </span>
                <Button variant="outline" size="sm" className="h-9 text-xs">Upload New Avatar</Button>
              </div>
            </Section>

            {/* Appearance & Locale */}
            <Section title="Appearance & locale" desc="Set up default dashboard presentation options.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-ink">Active Theme</label>
                  <div className="flex rounded-xl bg-surface-2 p-1 border border-line">
                    {(["dark", "light"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-bold capitalize transition-colors",
                          theme === t ? "bg-primary text-white" : "text-muted hover:text-ink"
                        )}
                      >
                        {t === "dark" ? <Moon size={14} /> : <Sun size={14} />} {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-ink">Base Currency</label>
                  <select
                    value={user.currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input h-10 rounded-xl"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Section>

            {/* Notifications Preferences */}
            <Section title="Notification Preferences" desc="Decide which email and warning reminders you want to receive.">
              {([
                { key: "overspend", label: "Overspend Warnings", desc: "Flag whenever a budget category limit is exceeded." },
                { key: "billDue", label: "Upcoming Subscription Reminders", desc: "Notify before manual bills or recurring schedules hit." },
                { key: "weekly", label: "Weekly Summary Reports", desc: "Deliver a consolidated workspace summary every Monday." },
              ] as const).map((n) => (
                <div key={n.key} className="flex items-center justify-between border-b border-line py-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-bold text-sm text-ink">{n.label}</div>
                    <div className="text-xs text-muted mt-0.5">{n.desc}</div>
                  </div>
                  <button
                    onClick={() => setNotif((s) => ({ ...s, [n.key]: !s[n.key] }))}
                    className={cn(
                      "relative h-6 w-11 rounded-pill transition-colors shrink-0",
                      notif[n.key] ? "bg-primary" : "bg-line"
                    )}
                    aria-pressed={notif[n.key]}
                  >
                    <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left,box-shadow] shadow-sm", notif[n.key] ? "left-5.5" : "left-0.5")} />
                  </button>
                </div>
              ))}
            </Section>

            {/* Workspace Data Controls */}
            <Section title="Privacy & Data Export" desc="Export or safely clear your financial history records.">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={exportData} className="text-xs h-10 font-bold">
                  <Download size={14} /> Export Workspace JSON
                </Button>
                <Button variant="danger" onClick={() => setConfirmDelete(true)} className="text-xs h-10 font-bold bg-[#EF4444] text-white">
                  <Trash2 size={14} /> Permanently Delete Account
                </Button>
              </div>
            </Section>
          </>
        )}

        {currentTab === "categories" && (
          <Section title="Custom categories" desc="Create original bookkeeping categories styled with dedicated hues.">
            <div className="flex flex-wrap gap-2.5">
              {categories.map((c) => {
                const meta = CATEGORY_META[c.key];
                const Icon = meta?.icon ?? Check;
                return (
                  <div key={c.id} className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 py-1.5 pl-2.5 pr-2">
                    <span className="grid h-6 w-6 place-items-center rounded-lg" style={{ background: `color-mix(in oklch, ${meta?.hue ?? "var(--primary)"} 15%, transparent)`, color: meta?.hue ?? "var(--primary)" }}>
                      <Icon size={12} strokeWidth={2.4} />
                    </span>
                    <span className="text-xs font-bold text-ink">{c.name}</span>
                    {!c.isDefault && (
                      <button onClick={() => deleteCategory(c.id)} className="rounded-full p-1 text-muted hover:text-danger hover:bg-danger/10 transition-colors" aria-label="Delete category">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 border-t border-line pt-5 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[160px]">
                <label className="mb-1 block text-xs font-bold uppercase text-ink">New Category Name</label>
                <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Pet Care" className="input h-10 rounded-xl" />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="mb-1 block text-xs font-bold uppercase text-ink">Aesthetic Style</label>
                <select value={newCatStyle} onChange={(e) => setNewCatStyle(e.target.value as CategoryKey)} className="input h-10 rounded-xl">
                  {CATEGORY_ORDER.map((k) => (
                    <option key={k} value={k}>{CATEGORY_META[k].name}</option>
                  ))}
                </select>
              </div>
              <Button onClick={addCat} className="h-10 text-xs"><Plus size={14} /> Add Category</Button>
            </div>
          </Section>
        )}

        {currentTab === "accounts" && (
          <Section title="Connected Institution Feeds" desc="Configure sync links with external financial accounts.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card p-4 flex items-center justify-between bg-surface-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <CreditCard size={18} />
                  </span>
                  <div>
                    <div className="font-bold text-sm text-ink">Chase bank sync</div>
                    <div className="text-xs text-muted">Checking &amp; Savings feeds active</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded uppercase">Connected</span>
              </div>
              
              <div className="card p-4 flex items-center justify-between bg-surface-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <CreditCard size={18} />
                  </span>
                  <div>
                    <div className="font-bold text-sm text-ink">American Express sync</div>
                    <div className="text-xs text-muted">Credit line feed active</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded uppercase">Connected</span>
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-5 flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-10 text-xs font-bold">
                <Plus size={14} /> Connect New Institution
              </Button>
              <span className="text-xs text-muted flex items-center gap-1">
                <Shield size={12} className="text-[#22C55E]" /> 256-bit bank level secure encryption.
              </span>
            </div>
          </Section>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Permanently erase account data?"
        message="This is a sandbox workspace simulation. In a live production environment, this would immediately and permanently wipe your personal MoneyTrail database records. Proceed?"
        confirmLabel="Erase Data"
        onConfirm={() => { setConfirmDelete(false); toast("Account data deletion simulation triggered.", "info"); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </AppShell>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 bg-white border border-line">
      <h2 className="text-base font-bold text-ink leading-tight">{title}</h2>
      <p className="text-xs text-muted mt-0.5 mb-5">{desc}</p>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase text-ink">{label}</span>
      {children}
    </label>
  );
}


