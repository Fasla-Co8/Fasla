import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, registrations, students } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { GOVERNORATE_KEYS } from "@/lib/governorates";
import { isValidEmail, normalizeEgyptPhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { deliverWhatsApp } from "@/lib/whatsapp";

const GENDERS = new Set(["male", "female", "undisclosed"]);
const SCHEDULES = new Set(["morning", "afternoon", "evening", "weekend", "flexible"]);
const LEVELS = new Set(["beginner", "a1", "a2", "b1", "b2", "c1", "unsure"]);

function ageFromDob(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const month = now.getMonth() - date.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < date.getDate())) age -= 1;
  return age;
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (!rateLimit(`register:${clientIp(request)}`, 8, 60 * 60 * 1000)) {
    return Response.json({ ok: false, error: "Too many registration attempts. Please try again later." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ ok: false, error: "Invalid form." }, { status: 400 });
  if (text(body.company, 80)) return Response.json({ ok: true, ignored: true });

  const fullName = text(body.fullName, 80);
  const dateOfBirth = text(body.dateOfBirth, 20);
  const age = Number(body.age);
  const gender = text(body.gender, 20);
  const governorate = text(body.governorate, 40);
  const city = text(body.city, 80);
  const whatsappNumber = text(body.whatsapp, 30);
  const altPhone = text(body.altPhone, 30);
  const email = text(body.email, 120).toLowerCase();
  const englishLevel = text(body.englishLevel, 20);
  const previousCourses = text(body.previousCourses, 800);
  const courseSlug = text(body.courseSlug, 80);
  const schedule = text(body.schedule, 20);
  const learningGoals = text(body.learningGoals, 800);
  const whyLearn = text(body.whyLearn, 1000);
  const difficulties = text(body.difficulties, 1000);
  const notes = text(body.notes, 1000);
  const computedAge = ageFromDob(dateOfBirth);
  const phone = normalizeEgyptPhone(whatsappNumber);
  const alt = altPhone ? normalizeEgyptPhone(altPhone) : null;

  if (fullName.length < 3) return Response.json({ ok: false, error: "Enter your full name." }, { status: 400 });
  if (computedAge == null || computedAge < 8 || computedAge > 90) {
    return Response.json({ ok: false, error: "Enter a valid date of birth." }, { status: 400 });
  }
  if (!Number.isInteger(age) || Math.abs(age - computedAge) > 1) {
    return Response.json({ ok: false, error: "Age must match the date of birth." }, { status: 400 });
  }
  if (!GENDERS.has(gender) || !GOVERNORATE_KEYS.has(governorate as never) || city.length < 2) {
    return Response.json({ ok: false, error: "Check governorate, city, and gender." }, { status: 400 });
  }
  if (!phone) return Response.json({ ok: false, error: "Enter a valid Egyptian WhatsApp number." }, { status: 400 });
  if (altPhone && !alt) return Response.json({ ok: false, error: "Alternative number is not a valid Egyptian mobile number." }, { status: 400 });
  if (!isValidEmail(email)) return Response.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  if (!LEVELS.has(englishLevel)) {
    return Response.json({ ok: false, error: "Select your current English level." }, { status: 400 });
  }
  if (!SCHEDULES.has(schedule) || learningGoals.length < 5) {
    return Response.json({ ok: false, error: "Complete your course schedule and learning goals." }, { status: 400 });
  }
  if (body.privacyConsent !== true) return Response.json({ ok: false, error: "Privacy consent is required." }, { status: 400 });

  await ensureSeed();
  const [course] = await db.select().from(courses).where(eq(courses.slug, courseSlug)).limit(1);
  if (!course || !course.active) return Response.json({ ok: false, error: "Select a valid course." }, { status: 400 });

  const [student] = await db
    .insert(students)
    .values({
      fullName,
      dateOfBirth,
      age: computedAge,
      gender,
      governorate,
      city,
      whatsapp: whatsappNumber,
      whatsappNormalized: phone,
      altPhone: altPhone || null,
      email,
      englishLevel,
      previousCourses: previousCourses || null,
      whyLearn: whyLearn || null,
      difficulties: difficulties || null,
      notes: notes || null,
      privacyConsent: true,
    })
    .returning();
  if (!student) return Response.json({ ok: false, error: "Could not save registration." }, { status: 500 });

  const [registration] = await db
    .insert(registrations)
    .values({
      studentId: student.id,
      courseId: course.id,
      courseSlug: course.slug,
      schedule,
      learningGoals,
      status: "new",
    })
    .returning();
  if (!registration) return Response.json({ ok: false, error: "Could not save registration." }, { status: 500 });

  const reference = `FAS-${String(registration.id).padStart(5, "0")}`;
  const price = course.contactPricing || course.price == null ? "Contact for pricing" : `EGP ${course.price}`;
  const message = [
    "FASLA Registration Report",
    `Reference: ${reference}`,
    `Name: ${fullName}`,
    `Date of birth: ${dateOfBirth}`,
    `Age: ${computedAge}`,
    `Gender: ${gender}`,
    `Governorate: ${governorate}`,
    `City: ${city}`,
    `WhatsApp: ${whatsappNumber}`,
    `Alternative number: ${altPhone || "—"}`,
    `Email: ${email}`,
    `Current English level: ${englishLevel}`,
    `Previous English courses: ${previousCourses || "—"}`,
    `Selected course: ${course.nameEn} (${course.cefr})`,
    `Listed fee: ${price}`,
    `Preferred schedule: ${schedule}`,
    `Learning goals: ${learningGoals}`,
    `Why English: ${whyLearn || "—"}`,
    `Biggest difficulties: ${difficulties || "—"}`,
    `Notes: ${notes || "—"}`,
    "Consent: privacy consent accepted.",
  ].join("\n");

  const delivery = await deliverWhatsApp({ kind: "registration", referenceId: reference, message });
  return Response.json({
    ok: true,
    reference,
    registrationId: registration.id,
    courseNameEn: course.nameEn,
    courseNameAr: course.nameAr,
    whatsapp: delivery,
  });
}
