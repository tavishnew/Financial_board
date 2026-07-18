"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("tavis@finance.app");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast("Enter your email and password", "error");
      return;
    }
    toast("Welcome back!", "success");
    router.push("/dashboard");
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your money in bold."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field icon={<Mail size={18} />} label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full bg-transparent text-ink outline-none"
            placeholder="you@email.com"
          />
        </Field>
        <Field icon={<Lock size={18} />} label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full bg-transparent text-ink outline-none"
            placeholder="••••••••"
          />
        </Field>
        <Button type="submit" className="w-full">
          Log in
        </Button>
        <button
          type="button"
          onClick={() => {
            toast("Demo mode — jumping in", "info");
            router.push("/dashboard");
          }}
          className="w-full text-sm font-semibold text-muted hover:text-ink"
        >
          Continue as guest (demo)
        </button>
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
