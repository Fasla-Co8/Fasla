"use client";

import Link from "next/link";
import { WhatsAppPanel, type DeliveryState } from "@/components/SiteChrome";
import { useI18n } from "@/components/LanguageProvider";
import { localized } from "@/lib/format";
import { GOVERNORATES } from "@/lib/governorates";
import type { CourseDTO } from "@/lib/types";

type Review = {
  questionId: string;
  stem: string;
  yourAnswer: string;
  solution: string;
  explanationEn: string;
  explanationAr: string;
  correct: boolean;
  partial: boolean;
  skill: string;
  level: string;
  pointsEarned: number;
  pointsPossible: number;
};

export function ResultsReport({
  student,
  score,
  maxScore,
  percentage,
  cefrLevel,
  grade,
  strengths,
  weaknesses,
  adviceEn,
  adviceAr,
  breakdown,
  reviews,
  courses,
  delivery,
}: {
  student: { fullName: string; age: number; governorate: string; whatsapp: string };
  score: number;
  maxScore: number;
  percentage: number;
  cefrLevel: string;
  grade: string;
  strengths: string[];
  weaknesses: string[];
  adviceEn: string[];
  adviceAr: string[];
  breakdown: { level: string; earned: number; possible: number; accuracy: number }[];
  reviews: Review[];
  courses: CourseDTO[];
  delivery: DeliveryState | null;
}) {
  const { lang, t } = useI18n();
  const incorrect = reviews.filter((review) => !review.correct);
  const gradeLabel = t.grades[grade as keyof typeof t.grades] ?? grade;
  const governorateLabel = GOVERNORATES.find((item) => item.key === student.governorate);
  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">FASLA</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-navy">{t.results.title}</h1>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div className="border border-black/10 p-4"><dt className="text-black/50">{t.placement.name}</dt><dd className="font-semibold">{student.fullName}</dd></div>
        <div className="border border-black/10 p-4"><dt className="text-black/50">{t.placement.age}</dt><dd className="font-semibold">{student.age}</dd></div>
        <div className="border border-black/10 p-4"><dt className="text-black/50">{t.placement.governorate}</dt><dd className="font-semibold">{governorateLabel ? (lang === "ar" ? governorateLabel.ar : governorateLabel.key) : student.governorate}</dd></div>
        <div className="border border-black/10 p-4"><dt className="text-black/50">{t.placement.whatsapp}</dt><dd className="font-semibold">{student.whatsapp}</dd></div>
      </dl>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Metric label={t.results.score} value={`${score} / ${maxScore}`} />
        <Metric label={t.results.percentage} value={`${percentage}%`} />
        <Metric label={t.results.level} value={cefrLevel} />
        <Metric label={t.results.grade} value={gradeLabel} />
      </div>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">{t.results.algorithm}</h2>
        <p className="mt-3 text-sm leading-7 text-black/75">{t.placement.algorithm}</p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">{t.results.bands}</h2>
        <div className="mt-4 grid gap-3">
          {breakdown.map((band) => (
            <div key={band.level}>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{band.level}</span>
                <span>{band.earned} / {band.possible} · {Math.round(band.accuracy * 100)}% {t.results.accuracy}</span>
              </div>
              <div className="mt-1 h-2 bg-black/10"><div className="h-2 bg-navy" style={{ width: `${Math.round(band.accuracy * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold">{t.results.strengths}</h2>
          <ul className="mt-3 list-disc ps-5 text-sm leading-7">{strengths.map((skill) => <li key={skill}>{t.skills[skill as keyof typeof t.skills] ?? skill}</li>)}</ul>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">{t.results.weaknesses}</h2>
          {weaknesses.length ? (
            <ul className="mt-3 list-disc ps-5 text-sm leading-7">{weaknesses.map((skill) => <li key={skill}>{t.skills[skill as keyof typeof t.skills] ?? skill}</li>)}</ul>
          ) : <p className="mt-3 text-sm">{t.results.noneWeak}</p>}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">{t.results.advice}</h2>
        <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-7">{(lang === "ar" ? adviceAr : adviceEn).map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">{t.results.courses}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {courses.map((course) => (
            <Link key={course.slug} href={`/register?course=${course.slug}`} className="bg-cta px-4 py-3 text-sm font-semibold text-navy">
              {localized(lang, course.nameEn, course.nameAr)}
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">{t.results.incorrect}</h2>
        {incorrect.length === 0 ? <p className="mt-3 text-sm">{t.results.noneIncorrect}</p> : (
          <div className="mt-4 grid gap-3">
            {incorrect.map((review) => (
              <article key={review.questionId} className="border border-black/10 p-4 text-sm leading-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">{review.level} · {t.skills[review.skill as keyof typeof t.skills] ?? review.skill}</p>
                <p className="mt-2 font-semibold">{review.stem}</p>
                <p className="mt-2">{t.challenge.yourAnswer}: {review.yourAnswer}</p>
                <p>{t.challenge.correctAnswer}: {review.solution}</p>
                {review.partial ? <p className="text-gold">{t.results.partial}: {review.pointsEarned} / {review.pointsPossible}</p> : null}
                <p className="mt-2 text-black/70">{lang === "ar" ? review.explanationAr : review.explanationEn}</p>
              </article>
            ))}
          </div>
        )}
      </section>
      {delivery ? <div className="mt-8"><WhatsAppPanel delivery={delivery} /></div> : null}
      <button type="button" onClick={() => window.print()} className="no-print mt-8 border border-ink px-4 py-3 text-sm font-semibold">{t.results.print}</button>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy p-4 text-white">
      <p className="text-xs uppercase tracking-[0.12em] text-white/60">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
