"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaslaLogo } from "@/components/Logo";
import { LanguageSwitch } from "@/components/SiteChrome";
import { useI18n } from "@/components/LanguageProvider";

export default function AdminLoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const fd = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    setPending(false);
    if (!data.ok) {
      setError(data.error || t.common.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-navy px-4 py-12 text-white">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-8 text-ink">
        <div className="mb-4 flex justify-end"><LanguageSwitch tone="dark" /></div>
        <div className="mx-auto w-32"><FaslaLogo variant="dark" /></div>
        <h1 className="mt-6 font-display text-3xl font-bold text-navy">{t.admin.login}</h1>
        <label className="mt-6 block text-sm font-semibold">{t.admin.email}<input className="field mt-1" name="email" type="email" required autoComplete="username" /></label>
        <label className="mt-4 block text-sm font-semibold">{t.admin.password}<input className="field mt-1" name="password" type="password" required autoComplete="current-password" /></label>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={pending} className="mt-5 w-full bg-cta px-4 py-3 font-semibold text-navy">{pending ? t.common.loading : t.admin.signIn}</button>
        <p className="mt-4 text-xs leading-5 text-black/55">{t.admin.hint}</p>
      </form>
    </main>
  );
}
