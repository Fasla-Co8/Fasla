"use client";

import Link from "next/link";
import { useState } from "react";
import { FaslaLogo, RopeRule } from "@/components/Logo";
import { QuestionCard } from "@/components/QuestionCard";
import { CourseCard, Footer, LanguageSwitch } from "@/components/SiteChrome";
import { useI18n } from "@/components/LanguageProvider";
import type { AnswerValue, PublicQuestion } from "@/lib/assessment/types";
import { localized } from "@/lib/format";
import { GOVERNORATES } from "@/lib/governorates";
import type { CourseDTO, PublicSettings, TestimonialDTO } from "@/lib/types";

type ChallengeResult = {
  score: number;
  percentage: number;
  performance: "outstanding" | "strong" | "developing" | "foundation";
  items: { id: string; stem: string; correct: boolean; yourAnswer: string; solution: string; explanationEn: string; explanationAr: string; skill: string }[];
  weaknesses: string[];
  recommendedSlugs: string[];
  recommendationsEn: string[];
  recommendationsAr: string[];
};

export function HomePage({
  courses,
  testimonials,
  settings,
}: {
  courses: CourseDTO[];
  testimonials: TestimonialDTO[];
  settings: PublicSettings;
}) {
  return (
    <>
      <Hero />
      <About />
      <Courses courses={courses} />
      <Challenge courses={courses} />
      <PlacementBand />
      <Stories testimonials={testimonials} />
      <AppBand />
      <Footer courses={courses} settings={settings} />
    </>
  );
}

function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative flex min-h-[100svh] flex-col bg-navy px-5 pb-16 pt-6 text-white">
      <div className="absolute end-5 top-5 z-10">
        <LanguageSwitch />
      </div>
      <div className="mx-auto mt-14 w-[min(64vw,280px)]">
        <FaslaLogo variant="light" />
      </div>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-display text-[clamp(2.4rem,6vw,4.7rem)] font-bold leading-[1.05] tracking-tight">
          {t.hero.before}
          <span className="hl">{t.hero.highlight}</span>
          {t.hero.after}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">{t.hero.subtitle}</p>
        <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <a href="#courses" className="bg-white px-6 py-4 text-center text-base font-semibold text-navy">{t.hero.explore}</a>
          <Link href="/register" className="bg-cta px-6 py-4 text-center text-base font-semibold text-navy">{t.hero.join}</Link>
        </div>
      </div>
    </section>
  );
}

function About() {
  const { t } = useI18n();
  const features = [t.about.f1, t.about.f2, t.about.f3];
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
        <figure>
          <img src="/images/about.jpg" alt={t.about.photoAlt} className="h-full max-h-[560px] w-full object-cover" />
          <figcaption className="mt-3 text-xs text-black/50">{t.about.photoCredit}</figcaption>
        </figure>
        <div>
          <RopeRule />
          <h2 className="mt-4 font-display text-4xl font-bold text-navy md:text-5xl">{t.about.title}</h2>
          <div className="mt-6 space-y-4 text-base leading-8 text-black/80">
            <p>{t.about.p1}</p>
            <p>{t.about.p2}</p>
            <p>{t.about.p3}</p>
            <p>{t.about.p4}</p>
            <p>{t.about.p5}</p>
          </div>
          <ul className="mt-8 grid gap-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-semibold">
                <span className="h-px w-8 bg-gold" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Courses({ courses }: { courses: CourseDTO[] }) {
  const { t } = useI18n();
  return (
    <section id="courses" className="bg-navy py-20 text-white">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-3xl">
          <RopeRule />
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">{t.courses.title}</h2>
          <p className="mt-4 text-lg text-white/75">{t.courses.subtitle}</p>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-5">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Challenge({ courses }: { courses: CourseDTO[] }) {
  const { lang, t } = useI18n();
  const [questions, setQuestions] = useState<PublicQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/challenge");
    const data = (await response.json()) as { questions?: PublicQuestion[] };
    if (!data.questions) {
      setError(t.common.error);
      setLoading(false);
      return;
    }
    setQuestions(data.questions);
    setIndex(0);
    setAnswers({});
    setResult(null);
    setLoading(false);
  }

  async function submit() {
    setLoading(true);
    const response = await fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = (await response.json()) as { result?: ChallengeResult };
    if (!data.result) setError(t.common.error);
    else setResult(data.result);
    setLoading(false);
  }

  const current = questions?.[index];
  const recommended = result ? courses.filter((course) => result.recommendedSlugs.includes(course.slug)) : [];

  return (
    <section id="challenge" className="bg-navy py-20 text-white">
      <div className="mx-auto max-w-3xl px-5">
        <RopeRule />
        <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">{t.challenge.title}</h2>
        <p className="mt-4 text-lg text-white/75">{t.challenge.subtitle}</p>
        <div className="mt-8 bg-white p-6 text-ink md:p-8">
          {!questions && !result ? (
            <button type="button" onClick={start} className="bg-cta px-6 py-4 font-semibold text-navy" disabled={loading}>
              {loading ? t.challenge.loading : t.challenge.start}
            </button>
          ) : null}
          {current && !result ? (
            <>
              <p className="text-sm font-semibold text-black/50">{t.challenge.question} {index + 1} {t.challenge.of} {questions?.length}</p>
              <div className="mt-4">
                <QuestionCard question={current} value={answers[current.id] ?? null} onChange={(value) => setAnswers((prev) => ({ ...prev, [current.id]: value }))} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {index > 0 ? <button type="button" className="border border-ink px-4 py-3 text-sm font-semibold" onClick={() => setIndex((value) => value - 1)}>{t.challenge.back}</button> : null}
                {index < (questions?.length ?? 1) - 1 ? (
                  <button type="button" className="bg-navy px-4 py-3 text-sm font-semibold text-white" onClick={() => setIndex((value) => value + 1)}>{t.challenge.next}</button>
                ) : (
                  <button type="button" className="bg-cta px-4 py-3 text-sm font-semibold text-navy" onClick={submit} disabled={loading}>{t.challenge.submit}</button>
                )}
              </div>
            </>
          ) : null}
          {result ? (
            <div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label={t.challenge.score} value={`${result.score} / 7`} />
                <Stat label={t.challenge.percentage} value={`${result.percentage}%`} />
                <Stat label={t.challenge.performance} value={t.challenge[result.performance]} />
              </div>
              <h3 className="mt-8 font-display text-2xl font-bold">{t.challenge.recommendations}</h3>
              <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-6">
                {(lang === "ar" ? result.recommendationsAr : result.recommendationsEn).map((item) => <li key={item}>{item}</li>)}
              </ul>
              <h3 className="mt-6 font-display text-xl font-bold">{t.challenge.weaknesses}</h3>
              <p className="mt-2 text-sm">{result.weaknesses.length ? result.weaknesses.map((skill) => t.skills[skill as keyof typeof t.skills] ?? skill).join("، ") : t.challenge.noneWrong}</p>
              <h3 className="mt-6 font-display text-xl font-bold">{t.challenge.solutions}</h3>
              <div className="mt-3 grid gap-3">
                {result.items.map((item, itemIndex) => (
                  <article key={item.id} className="border border-black/10 p-4 text-sm">
                    <p className="font-semibold">{itemIndex + 1}. {item.stem}</p>
                    <p className="mt-2">{t.challenge.yourAnswer}: {item.yourAnswer}</p>
                    <p>{t.challenge.correctAnswer}: {item.solution}</p>
                    <p className="mt-2 text-black/70">{lang === "ar" ? item.explanationAr : item.explanationEn}</p>
                  </article>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {recommended.map((course) => (
                  <Link key={course.slug} href={`/register?course=${course.slug}`} className="bg-cta px-4 py-3 text-sm font-semibold text-navy">
                    {localized(lang, course.nameEn, course.nameAr)}
                  </Link>
                ))}
                <button type="button" className="border border-ink px-4 py-3 text-sm font-semibold" onClick={() => { setQuestions(null); setResult(null); }}>{t.challenge.retry}</button>
              </div>
            </div>
          ) : null}
          {error ? <p className="mt-4 text-sm">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-black/50">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function PlacementBand() {
  const { lang, t } = useI18n();
  const [form, setForm] = useState({ fullName: "", age: "", governorate: "", whatsapp: "", acknowledged: false });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const stats = [t.placementHome.questions, t.placementHome.levels, t.placementHome.free, t.placementHome.report];

  async function start(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/placement/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, age: Number(form.age), locale: lang, acknowledged: form.acknowledged }),
    });
    const data = (await response.json()) as { ok?: boolean; token?: string; error?: string };
    if (!response.ok || !data.token) {
      setError(data.error || t.common.error);
      setPending(false);
      return;
    }
    window.location.href = data.ok && (data as { alreadyCompleted?: boolean }).alreadyCompleted ? `/placement/results/${data.token}` : `/placement/test/${data.token}`;
  }

  return (
    <section id="placement" className="bg-leaf py-20 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">{t.placementHome.title}</h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-white/90">{t.placementHome.subtitle}</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat} className="border border-white/30 px-4 py-5 text-sm font-semibold">{stat}</div>
            ))}
          </div>
          <Link href="/placement" className="mt-8 inline-block bg-white px-6 py-4 font-semibold text-navy">{t.placementHome.start}</Link>
        </div>
        <form onSubmit={start} className="bg-white p-6 text-ink">
          <h3 className="font-display text-2xl font-bold text-navy">{t.placement.title}</h3>
          <label className="mt-4 block text-sm font-semibold">{t.placement.name}
            <input className="field mt-1" required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          </label>
          <label className="mt-3 block text-sm font-semibold">{t.placement.age}
            <input className="field mt-1" required type="number" min={8} max={90} value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} />
          </label>
          <label className="mt-3 block text-sm font-semibold">{t.placement.governorate}
            <select className="field mt-1" required value={form.governorate} onChange={(event) => setForm({ ...form, governorate: event.target.value })}>
              <option value="">{t.placement.selectGov}</option>
              {GOVERNORATES.map((item) => <option key={item.key} value={item.key}>{lang === "ar" ? item.ar : item.key}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-sm font-semibold">{t.placement.whatsapp}
            <input className="field mt-1" required value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} placeholder="01xxxxxxxxx" />
          </label>
          <label className="mt-4 flex items-start gap-2 text-sm leading-6">
            <input type="checkbox" className="mt-1" checked={form.acknowledged} onChange={(event) => setForm({ ...form, acknowledged: event.target.checked })} required />
            <span>{t.placement.acknowledge}</span>
          </label>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          <button type="submit" disabled={pending} className="mt-4 w-full bg-cta px-4 py-3 font-semibold text-navy">{pending ? t.common.loading : t.placement.begin}</button>
        </form>
      </div>
    </section>
  );
}

function Stories({ testimonials }: { testimonials: TestimonialDTO[] }) {
  const { lang, t } = useI18n();
  const cards = [...testimonials, ...testimonials];
  const allDemo = testimonials.every((item) => item.isDemo);
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <RopeRule />
        <h2 className="mt-4 font-display text-4xl font-bold text-navy md:text-5xl">{t.testimonials.title}</h2>
        {allDemo ? <p className="mt-4 max-w-3xl text-sm leading-7 text-black/65">{t.testimonials.note}</p> : null}
      </div>
      <div className="ticker mt-8" dir="ltr" aria-label={t.testimonials.title}>
        <div className="ticker-track px-5">
          {cards.map((item, index) => (
            <article key={`${item.id}-${index}`} dir={lang === "ar" ? "rtl" : "ltr"} className="w-[320px] shrink-0 border border-black/10 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full text-sm font-bold text-white" style={{ background: `hsl(${item.avatarHue} 45% 32%)` }}>{item.initials}</div>
                <div>
                  <p className="font-semibold">{localized(lang, item.nameEn, item.nameAr)}</p>
                  <p className="text-xs text-black/55">{localized(lang, item.affiliationEn, item.affiliationAr)}</p>
                </div>
              </div>
              <p className="mt-3 text-gold" aria-label={`${item.rating} / 5`}>{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</p>
              {item.isDemo ? <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">{t.testimonials.sample}</p> : null}
              <p className="mt-3 text-sm leading-6 text-black/80">{localized(lang, item.reviewEn, item.reviewAr)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppBand() {
  const { t } = useI18n();
  return (
    <section className="bg-cta py-20 text-navy">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">{t.app.title}</h2>
          <p className="mt-4 max-w-xl text-lg leading-8">{t.app.body}</p>
          <p className="mt-6 inline-block border border-navy px-3 py-1 text-sm font-semibold">{t.app.soon}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" disabled aria-disabled="true" className="cursor-not-allowed border border-navy/40 px-4 py-3 text-sm font-semibold opacity-80">{t.app.google}</button>
            <button type="button" disabled aria-disabled="true" className="cursor-not-allowed border border-navy/40 px-4 py-3 text-sm font-semibold opacity-80">{t.app.apple}</button>
          </div>
          <p className="mt-3 text-sm">{t.app.noLink}</p>
        </div>
        <div className="flex justify-center">
          <div className="phone">
            <div className="phone-screen p-4">
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-black/20" />
              <div className="bg-navy p-4 text-white">
                <p className="font-display text-2xl font-bold">FASLA</p>
                <p className="mt-1 text-xs text-white/70">{t.app.soon}</p>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-black/45">{t.app.lesson}</p>
              <div className="mt-2 border border-black/10 bg-white p-4">
                <p className="font-semibold">{t.app.unit}</p>
                <div className="mt-3 h-2 bg-black/10"><div className="h-2 w-2/3 bg-brand" /></div>
                <p className="mt-2 text-xs">{t.app.progress} · 64%</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                <div className="bg-white p-3">A1</div>
                <div className="bg-white p-3">{t.app.speak}</div>
                <div className="bg-white p-3">{t.app.write}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

