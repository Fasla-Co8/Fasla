"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WhatsAppPanel, type DeliveryState } from "@/components/SiteChrome";
import { useI18n } from "@/components/LanguageProvider";
import { localized, priceLabel } from "@/lib/format";
import { GOVERNORATES } from "@/lib/governorates";
import type { CourseDTO } from "@/lib/types";

const empty = {
  fullName: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  governorate: "",
  city: "",
  whatsapp: "",
  altPhone: "",
  email: "",
  englishLevel: "",
  previousCourses: "",
  courseSlug: "",
  schedule: "",
  learningGoals: "",
  whyLearn: "",
  difficulties: "",
  notes: "",
  privacyConsent: false,
  company: "",
};

export function RegisterForm({ courses, initialCourse }: { courses: CourseDTO[]; initialCourse: string }) {
  const { lang, t } = useI18n();
  const [form, setForm] = useState({ ...empty, courseSlug: courses.some((course) => course.slug === initialCourse) ? initialCourse : "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ reference: string; courseName: string; whatsapp: DeliveryState } | null>(null);
  const selected = useMemo(() => courses.find((course) => course.slug === form.courseSlug), [courses, form.courseSlug]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onDob(value: string) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      set("dateOfBirth", value);
      return;
    }
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const month = now.getMonth() - date.getMonth();
    if (month < 0 || (month === 0 && now.getDate() < date.getDate())) age -= 1;
    setForm((current) => ({ ...current, dateOfBirth: value, age: String(age) }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, age: Number(form.age) }),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string; reference?: string; courseNameEn?: string; courseNameAr?: string; whatsapp?: DeliveryState };
    setPending(false);
    if (!response.ok || !data.reference || !data.whatsapp) {
      setError(data.error || t.common.error);
      return;
    }
    setDone({ reference: data.reference, courseName: lang === "ar" ? data.courseNameAr || "" : data.courseNameEn || "", whatsapp: data.whatsapp });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">FASLA</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-navy">{t.register.success}</h1>
        <p className="mt-4 leading-7">{t.register.successBody}</p>
        <p className="mt-4 font-semibold">{t.register.reference}: {done.reference}</p>
        <p className="text-sm text-black/70">{done.courseName}</p>
        <div className="mt-6"><WhatsAppPanel delivery={done.whatsapp} /></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1fr_280px]">
      <div>
        <h1 className="font-display text-4xl font-bold text-navy">{t.register.title}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-black/70">{t.register.intro}</p>
        <input className="hidden" tabIndex={-1} autoComplete="off" value={form.company} onChange={(event) => set("company", event.target.value)} aria-hidden="true" />
        <Section title={t.register.personal}>
          <Field label={t.register.fullName}><input className="field" required value={form.fullName} onChange={(event) => set("fullName", event.target.value)} /></Field>
          <Field label={t.register.dob}><input className="field" required type="date" value={form.dateOfBirth} onChange={(event) => onDob(event.target.value)} /></Field>
          <Field label={t.register.age}><input className="field" required type="number" min={8} max={90} value={form.age} onChange={(event) => set("age", event.target.value)} /></Field>
          <Field label={t.register.gender}>
            <select className="field" required value={form.gender} onChange={(event) => set("gender", event.target.value)}>
              <option value="">{t.register.select}</option>
              {Object.entries(t.gender).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </Field>
          <Field label={t.register.governorate}>
            <select className="field" required value={form.governorate} onChange={(event) => set("governorate", event.target.value)}>
              <option value="">{t.register.select}</option>
              {GOVERNORATES.map((item) => <option key={item.key} value={item.key}>{lang === "ar" ? item.ar : item.key}</option>)}
            </select>
          </Field>
          <Field label={t.register.city}><input className="field" required value={form.city} onChange={(event) => set("city", event.target.value)} /></Field>
        </Section>
        <Section title={t.register.contact}>
          <Field label={t.register.whatsapp}><input className="field" required value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} placeholder="01xxxxxxxxx" /></Field>
          <Field label={`${t.register.alt} (${t.register.optional})`}><input className="field" value={form.altPhone} onChange={(event) => set("altPhone", event.target.value)} /></Field>
          <Field label={t.register.email}><input className="field" required type="email" value={form.email} onChange={(event) => set("email", event.target.value)} /></Field>
        </Section>
        <Section title={t.register.education}>
          <Field label={t.register.level}>
            <select className="field" required value={form.englishLevel} onChange={(event) => set("englishLevel", event.target.value)}>
              <option value="">{t.register.select}</option>
              {Object.entries(t.levels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </Field>
          <Field label={`${t.register.previous} (${t.register.optional})`}><textarea className="field min-h-24" value={form.previousCourses} onChange={(event) => set("previousCourses", event.target.value)} /></Field>
        </Section>
        <Section title={t.register.course}>
          <Field label={t.register.selected}>
            <select className="field" required value={form.courseSlug} onChange={(event) => set("courseSlug", event.target.value)}>
              <option value="">{t.register.select}</option>
              {courses.map((course) => <option key={course.slug} value={course.slug}>{localized(lang, course.nameEn, course.nameAr)} · {priceLabel(course, lang)}</option>)}
            </select>
          </Field>
          <Field label={t.register.schedule}>
            <select className="field" required value={form.schedule} onChange={(event) => set("schedule", event.target.value)}>
              <option value="">{t.register.select}</option>
              {Object.entries(t.schedules).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </Field>
          <Field label={t.register.goals}><textarea className="field min-h-24" required value={form.learningGoals} onChange={(event) => set("learningGoals", event.target.value)} /></Field>
        </Section>
        <Section title={`${t.register.extra} (${t.register.optional})`}>
          <Field label={`${t.register.why} (${t.register.optional})`}><textarea className="field min-h-24" value={form.whyLearn} onChange={(event) => set("whyLearn", event.target.value)} /></Field>
          <Field label={`${t.register.difficulties} (${t.register.optional})`}><textarea className="field min-h-24" value={form.difficulties} onChange={(event) => set("difficulties", event.target.value)} /></Field>
          <Field label={`${t.register.notes} (${t.register.optional})`}><textarea className="field min-h-24" value={form.notes} onChange={(event) => set("notes", event.target.value)} /></Field>
        </Section>
        <label className="mt-6 flex items-start gap-2 text-sm leading-6">
          <input type="checkbox" className="mt-1" checked={form.privacyConsent} onChange={(event) => set("privacyConsent", event.target.checked)} required />
          <span>{t.register.consent} <Link href="/privacy" className="underline">{t.footer.privacy}</Link></span>
        </label>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={pending} className="mt-6 bg-cta px-6 py-4 font-semibold text-navy">{pending ? t.register.sending : t.register.submit}</button>
      </div>
      <aside className="h-fit border border-black/10 p-5 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{t.register.selected}</p>
        {selected ? (
          <>
            <h2 className="mt-2 font-display text-2xl font-bold">{localized(lang, selected.nameEn, selected.nameAr)}</h2>
            <p className="mt-2 text-sm">{priceLabel(selected, lang)}</p>
            <p className="mt-3 text-sm leading-6 text-black/70">{localized(lang, selected.durationEn, selected.durationAr)}</p>
          </>
        ) : <p className="mt-3 text-sm text-black/60">{t.register.select}</p>}
        <p className="mt-4 text-xs leading-5 text-black/55">{t.courses.payment}</p>
      </aside>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl font-bold text-navy">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold sm:col-span-1">{label}<div className="mt-1 font-normal">{children}</div></label>;
}
