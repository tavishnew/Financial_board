"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      toast("Fill in every field to continue", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast(data.error ?? "Could not create account — is that email taken?", "error");
        return;
      }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        toast("Account created — please log in", "info");
        router.push("/login");
        return;
      }
      router.push("/onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Thirty seconds to a clearer money life."
      footer={
        <>
          Already have one?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field icon={<UserIcon size={18} />} label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 w-full bg-transparent text-ink outline-none"
            placeholder="Tavis"
            autoComplete="name"
          />
        </Field>
        <Field icon={<Mail size={18} />} label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full bg-transparent text-ink outline-none"
            placeholder="you@email.com"
            autoComplete="email"
          />
        </Field>
        <Field icon={<Lock size={18} />} label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full bg-transparent text-ink outline-none"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 text-muted focus-within:border-primary">
        {icon}
        {children}
      </div>
    </label>
  );
}
