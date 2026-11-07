import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, testimonials } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getSettings } from "@/lib/settings";
import type { CourseDTO, Curriculum, Faq, TestimonialDTO } from "@/lib/types";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function toCourseDTO(row: typeof courses.$inferSelect): CourseDTO {
  const curriculum = (row.curriculum ?? { units: [] }) as Curriculum;
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    cefr: row.cefr,
    durationEn: row.durationEn,
    durationAr: row.durationAr,
    units: row.units,
    lessons: row.lessons,
    unitsLabelEn: row.unitsLabelEn,
    unitsLabelAr: row.unitsLabelAr,
    lessonsLabelEn: row.lessonsLabelEn,
    lessonsLabelAr: row.lessonsLabelAr,
    price: row.price,
    currency: row.currency,
    descriptionEn: row.descriptionEn,
    descriptionAr: row.descriptionAr,
    skillsEn: asArray<string>(row.skillsEn),
    skillsAr: asArray<string>(row.skillsAr),
    outcomesEn: asArray<string>(row.outcomesEn),
    outcomesAr: asArray<string>(row.outcomesAr),
    curriculum: curriculum?.units ? curriculum : { units: [] },
    faqs: asArray<Faq>(row.faqs),
    contactPricing: row.contactPricing,
    sortOrder: row.sortOrder,
    active: row.active,
  };
}

export function toTestimonialDTO(row: typeof testimonials.$inferSelect): TestimonialDTO {
  return {
    id: row.id,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    affiliationEn: row.affiliationEn,
    affiliationAr: row.affiliationAr,
    rating: row.rating,
    reviewEn: row.reviewEn,
    reviewAr: row.reviewAr,
    initials: row.initials,
    avatarHue: row.avatarHue,
    isDemo: row.isDemo,
    sortOrder: row.sortOrder,
  };
}

export async function getPublicData() {
  await ensureSeed();
  const [courseRows, testimonyRows, settings] = await Promise.all([
    db.select().from(courses).where(eq(courses.active, true)).orderBy(asc(courses.sortOrder)),
    db.select().from(testimonials).where(eq(testimonials.active, true)).orderBy(asc(testimonials.sortOrder)),
    getSettings(),
  ]);
  return {
    courses: courseRows.map(toCourseDTO),
    testimonials: testimonyRows.map(toTestimonialDTO),
    settings,
  };
}

export async function getCourseBySlug(slug: string) {
  await ensureSeed();
  const [row] = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  if (!row || !row.active) return null;
  return toCourseDTO(row);
}
