"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      toast("Fill in every field to continue", "error");
      return;
    }
    toast("Account created — let's set you up", "success");
    router.push("/onboarding");
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Thirty seconds to a bolder money life."
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
          />
        </Field>
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
