"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { GOVERNORATES } from "@/lib/governorates";

export function PlacementGate({ existing }: { existing: { token: string; status: "in_progress" | "completed" } | null }) {
  const { lang, t } = useI18n();
  const [form, setForm] = useState({ fullName: "", age: "", governorate: "", whatsapp: "", acknowledged: false });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function start(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/placement/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, age: Number(form.age), locale: lang, acknowledged: form.acknowledged }),
    });
    const data = (await response.json()) as { token?: string; error?: string; alreadyCompleted?: boolean };
    if (!response.ok || !data.token) {
      setError(data.error || t.common.error);
      setPending(false);
      return;
    }
    window.location.href = data.alreadyCompleted ? `/placement/results/${data.token}` : `/placement/test/${data.token}`;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-4xl font-bold text-navy">{t.placement.title}</h1>
        <p className="mt-4 leading-8 text-black/75">{t.placement.intro}</p>
        <h2 className="mt-8 font-display text-2xl font-bold">{t.placement.rulesTitle}</h2>
        <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-7">
          <li>{t.placement.rule1}</li>
          <li>{t.placement.rule2}</li>
          <li>{t.placement.rule3}</li>
          <li>{t.placement.rule4}</li>
        </ul>
        <p className="mt-6 text-sm leading-7 text-black/70">{t.placement.algorithm}</p>
        {existing ? (
          <div className="mt-6 border border-black/10 p-4">
            <p className="text-sm">{existing.status === "completed" ? t.placement.completed : t.placement.continue}</p>
            <Link href={existing.status === "completed" ? `/placement/results/${existing.token}` : `/placement/test/${existing.token}`} className="mt-3 inline-block bg-navy px-4 py-3 text-sm font-semibold text-white">
              {existing.status === "completed" ? t.placement.view : t.placement.continue}
            </Link>
          </div>
        ) : null}
      </div>
      <form onSubmit={start} className="border border-black/10 p-6">
        <label className="block text-sm font-semibold">{t.placement.name}<input className="field mt-1" required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
        <label className="mt-3 block text-sm font-semibold">{t.placement.age}<input className="field mt-1" required type="number" min={8} max={90} value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} /></label>
        <label className="mt-3 block text-sm font-semibold">{t.placement.governorate}
          <select className="field mt-1" required value={form.governorate} onChange={(event) => setForm({ ...form, governorate: event.target.value })}>
            <option value="">{t.placement.selectGov}</option>
            {GOVERNORATES.map((item) => <option key={item.key} value={item.key}>{lang === "ar" ? item.ar : item.key}</option>)}
          </select>
        </label>
        <label className="mt-3 block text-sm font-semibold">{t.placement.whatsapp}<input className="field mt-1" required placeholder="01xxxxxxxxx" value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} /></label>
        <label className="mt-4 flex items-start gap-2 text-sm leading-6">
          <input type="checkbox" className="mt-1" required checked={form.acknowledged} onChange={(event) => setForm({ ...form, acknowledged: event.target.checked })} />
          <span>{t.placement.acknowledge}</span>
        </label>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={pending} className="mt-5 w-full bg-cta px-4 py-3 font-semibold text-navy">{pending ? t.common.loading : t.placement.begin}</button>
      </form>
    </div>
  );
}
