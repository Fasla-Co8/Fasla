import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, courses, siteSettings, testimonials } from "@/db/schema";
import { courseSeed, testimonialSeed } from "@/lib/catalog";
import { hashPassword } from "@/lib/password";
import { DEFAULT_SETTINGS, LEGACY_SOCIAL_DEFAULTS } from "@/lib/settings";

const globalForSeed = globalThis as typeof globalThis & { __faslaSeed?: Promise<void> };

async function seed() {
  const existingCourses = await db.select({ id: courses.id }).from(courses).limit(1);
  if (!existingCourses.length) {
    await db.insert(courses).values(
      courseSeed.map((course) => ({
        slug: course.slug,
        nameEn: course.nameEn,
        nameAr: course.nameAr,
        cefr: course.cefr,
        durationEn: course.durationEn,
        durationAr: course.durationAr,
        units: course.units,
        lessons: course.lessons,
        unitsLabelEn: course.unitsLabelEn ?? null,
        unitsLabelAr: course.unitsLabelAr ?? null,
        lessonsLabelEn: course.lessonsLabelEn ?? null,
        lessonsLabelAr: course.lessonsLabelAr ?? null,
        price: course.price,
        descriptionEn: course.descriptionEn,
        descriptionAr: course.descriptionAr,
        skillsEn: course.skillsEn,
        skillsAr: course.skillsAr,
        outcomesEn: course.outcomesEn,
        outcomesAr: course.outcomesAr,
        curriculum: course.curriculum,
        faqs: course.faqs,
        contactPricing: course.contactPricing,
        sortOrder: course.sortOrder,
        active: true,
      })),
    );
  }

  const existingStories = await db.select({ id: testimonials.id }).from(testimonials).limit(1);
  if (!existingStories.length) {
    await db.insert(testimonials).values(testimonialSeed);
  }

  // Replace only the former starter address; preserve any later admin edits.
  await db
    .update(siteSettings)
    .set({ value: DEFAULT_SETTINGS.email })
    .where(and(eq(siteSettings.key, "email"), eq(siteSettings.value, "hello@fasla.com")));

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    if (!existing) {
      await db.insert(siteSettings).values({ key, value });
    } else if (
      Object.prototype.hasOwnProperty.call(LEGACY_SOCIAL_DEFAULTS, key) &&
      existing.value === LEGACY_SOCIAL_DEFAULTS[key]
    ) {
      await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
    }
  }

  const [admin] = await db.select().from(adminUsers).limit(1);
  if (!admin) {
    await db.insert(adminUsers).values({
      email: (process.env.ADMIN_EMAIL || "admin@fasla.com").toLowerCase(),
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD || "Fasla#2026"),
      name: "FASLA Admin",
      role: "admin",
    });
  }
}

export function ensureSeed() {
  if (!globalForSeed.__faslaSeed) {
    globalForSeed.__faslaSeed = seed().catch((error) => {
      globalForSeed.__faslaSeed = undefined;
      throw error;
    });
  }
  return globalForSeed.__faslaSeed;
}
