"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { localized, priceLabel } from "@/lib/format";
import type { CourseDTO } from "@/lib/types";

export function CourseDetail({ course }: { course: CourseDTO }) {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(0);
  const skills = lang === "ar" ? course.skillsAr : course.skillsEn;
  const outcomes = lang === "ar" ? course.outcomesAr : course.outcomesEn;
  const units = course.unitsLabelEn ? localized(lang, course.unitsLabelEn, course.unitsLabelAr || course.unitsLabelEn) : String(course.units);
  const lessons = course.lessonsLabelEn ? localized(lang, course.lessonsLabelEn, course.lessonsLabelAr || course.lessonsLabelEn) : String(course.lessons);
  return (
    <article className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/courses" className="text-sm font-semibold text-brand">{t.courses.back}</Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand">{course.cefr}</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-navy md:text-5xl">{localized(lang, course.nameEn, course.nameAr)}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8">{localized(lang, course.descriptionEn, course.descriptionAr)}</p>
      <dl className="mt-8 grid gap-3 sm:grid-cols-4">
        <Meta label={t.courses.duration} value={localized(lang, course.durationEn, course.durationAr)} />
        <Meta label={t.courses.units} value={units} />
        <Meta label={t.courses.lessons} value={lessons} />
        <Meta label={t.courses.price} value={priceLabel(course, lang)} />
      </dl>
      <p className="mt-4 text-sm text-black/60">{t.courses.payment}</p>
      <Link href={`/register?course=${course.slug}`} className="mt-6 inline-block bg-cta px-6 py-4 font-semibold text-navy">{t.courses.register}</Link>
      <section className="mt-12">
        <h2 className="font-display text-3xl font-bold">{t.courses.outcomes}</h2>
        <ul className="mt-4 list-disc space-y-2 ps-5 leading-7">{outcomes.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="mt-10">
        <h2 className="font-display text-3xl font-bold">{t.courses.skills}</h2>
        <ul className="mt-4 flex flex-wrap gap-2">{skills.map((skill) => <li key={skill} className="border border-black/10 px-3 py-2 text-sm">{skill}</li>)}</ul>
      </section>
      <section className="mt-10">
        <h2 className="font-display text-3xl font-bold">{t.courses.curriculum}</h2>
        {course.contactPricing ? <p className="mt-3 text-sm text-black/60">{t.courses.sample}</p> : null}
        <div className="mt-4 divide-y divide-black/10 border border-black/10">
          {course.curriculum.units.map((unit, index) => (
            <div key={unit.titleEn}>
              <button type="button" className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start font-semibold" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>
                <span>{index + 1}. {localized(lang, unit.titleEn, unit.titleAr)}</span>
                <span className="text-sm text-black/50">{unit.lessons.length}</span>
              </button>
              {open === index ? (
                <div className="px-4 pb-4">
                  <p className="text-sm text-black/70">{localized(lang, unit.objectiveEn, unit.objectiveAr)}</p>
                  <ol className="mt-3 list-decimal space-y-1 ps-5 text-sm leading-6">
                    {unit.lessons.map((lesson) => <li key={lesson.titleEn}>{localized(lang, lesson.titleEn, lesson.titleAr)}</li>)}
                  </ol>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="font-display text-3xl font-bold">{t.courses.faqs}</h2>
        <div className="mt-4 grid gap-4">
          {course.faqs.map((faq) => (
            <article key={faq.qEn} className="border border-black/10 p-4">
              <h3 className="font-semibold">{localized(lang, faq.qEn, faq.qAr)}</h3>
              <p className="mt-2 text-sm leading-6 text-black/75">{localized(lang, faq.aEn, faq.aAr)}</p>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="border border-black/10 p-4"><dt className="text-xs uppercase tracking-[0.12em] text-black/45">{label}</dt><dd className="mt-2 font-semibold">{value}</dd></div>;
}
