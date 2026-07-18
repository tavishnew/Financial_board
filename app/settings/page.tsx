"use client";

import { useState } from "react";
import { Plus, Sun, Moon, Bell, Download, Trash2, Check } from "lucide-react";
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

  function exportData() {
    const blob = new Blob([JSON.stringify({ user, categories }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finboard-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported your data", "success");
  }

  function addCat() {
    if (!newCatName.trim()) return;
    addCategory(newCatStyle, newCatName.trim());
    setNewCatName("");
    toast("Category added", "success");
  }

  return (
    <AppShell>
      <div className="mb-6">
        <div className="kicker">Make it yours</div>
        <h1 className="display text-3xl text-ink">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <Section title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </Field>
            <Field label="Email">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </Field>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-xl font-bold text-on-primary">
              {name.charAt(0).toUpperCase()}
            </span>
            <Button variant="outline" size="sm">Change avatar</Button>
          </div>
        </Section>

        {/* Appearance + currency */}
        <Section title="Appearance & locale">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Theme</label>
              <div className="flex rounded-2xl bg-surface-2 p-1">
                {(["dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold capitalize transition-colors",
                      theme === t ? "bg-primary text-on-primary" : "text-muted hover:text-ink"
                    )}
                  >
                    {t === "dark" ? <Moon size={16} /> : <Sun size={16} />} {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Currency</label>
              <select
                value={user.currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={<Bell size={18} className="text-primary" />}>
          {([
            { key: "overspend", label: "Overspend alerts", desc: "Warn me when a category goes over budget." },
            { key: "billDue", label: "Bill due reminders", desc: "Remind me before recurring bills hit." },
            { key: "weekly", label: "Weekly summary", desc: "A Monday recap of last week's spend." },
          ] as const).map((n) => (
            <div key={n.key} className="flex items-center justify-between border-b border-line py-3 last:border-0">
              <div>
                <div className="font-semibold text-ink">{n.label}</div>
                <div className="text-sm text-muted">{n.desc}</div>
              </div>
              <button
                onClick={() => setNotif((s) => ({ ...s, [n.key]: !s[n.key] }))}
                className={cn(
                  "relative h-7 w-12 rounded-pill transition-colors",
                  notif[n.key] ? "bg-primary" : "bg-surface-2"
                )}
                aria-pressed={notif[n.key]}
              >
                <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white transition-all", notif[n.key] ? "left-6" : "left-1")} />
              </button>
            </div>
          ))}
        </Section>

        {/* Categories */}
        <Section title="Categories">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const meta = CATEGORY_META[c.key];
              const Icon = meta.icon;
              return (
                <div key={c.id} className="flex items-center gap-2 rounded-pill border border-line bg-surface-2 py-1.5 pl-2 pr-1.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: `color-mix(in oklch, ${meta.hue} 18%, transparent)`, color: meta.hue }}>
                    <Icon size={14} strokeWidth={2.4} />
                  </span>
                  <span className="text-sm font-semibold text-ink">{c.name}</span>
                  {!c.isDefault && (
                    <button onClick={() => deleteCategory(c.id)} className="rounded-full p-1 text-muted hover:text-[color:var(--c-bills)]" aria-label="Delete category">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1 block text-sm font-semibold text-ink">New category name</label>
              <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Pet care" className="input" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="mb-1 block text-sm font-semibold text-ink">Style</label>
              <select value={newCatStyle} onChange={(e) => setNewCatStyle(e.target.value as CategoryKey)} className="input">
                {CATEGORY_ORDER.map((k) => (
                  <option key={k} value={k}>{CATEGORY_META[k].name}</option>
                ))}
              </select>
            </div>
            <Button onClick={addCat}><Plus size={16} /> Add</Button>
          </div>
        </Section>

        {/* Data + danger */}
        <Section title="Your data">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={exportData}><Download size={16} /> Export all data</Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 size={16} /> Delete account</Button>
          </div>
        </Section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete account?"
        message="This is a demo — in production this would permanently erase your data. Continue anyway?"
        confirmLabel="Delete"
        onConfirm={() => { setConfirmDelete(false); toast("Account deletion is disabled in demo", "info"); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </AppShell>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}
