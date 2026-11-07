import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import type { AnswerValue, Presentation } from "@/lib/assessment/types";
import type { Curriculum, Faq } from "@/lib/types";

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  cefr: text("cefr").notNull(),
  durationEn: text("duration_en").notNull(),
  durationAr: text("duration_ar").notNull(),
  units: integer("units").notNull(),
  lessons: integer("lessons").notNull(),
  unitsLabelEn: text("units_label_en"),
  unitsLabelAr: text("units_label_ar"),
  lessonsLabelEn: text("lessons_label_en"),
  lessonsLabelAr: text("lessons_label_ar"),
  price: doublePrecision("price"),
  currency: text("currency").notNull().default("EGP"),
  descriptionEn: text("description_en").notNull(),
  descriptionAr: text("description_ar").notNull(),
  skillsEn: jsonb("skills_en").$type<string[]>().notNull(),
  skillsAr: jsonb("skills_ar").$type<string[]>().notNull(),
  outcomesEn: jsonb("outcomes_en").$type<string[]>().notNull(),
  outcomesAr: jsonb("outcomes_ar").$type<string[]>().notNull(),
  curriculum: jsonb("curriculum").$type<Curriculum>().notNull(),
  faqs: jsonb("faqs").$type<Faq[]>().notNull(),
  contactPricing: boolean("contact_pricing").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const students = pgTable(
  "students",
  {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    dateOfBirth: text("date_of_birth").notNull(),
    age: integer("age").notNull(),
    gender: text("gender").notNull(),
    governorate: text("governorate").notNull(),
    city: text("city").notNull(),
    whatsapp: text("whatsapp").notNull(),
    whatsappNormalized: text("whatsapp_normalized").notNull(),
    altPhone: text("alt_phone"),
    email: text("email").notNull(),
    // Legacy education columns are retained for old records only; new registrations do not collect them.
    university: text("university"),
    faculty: text("faculty"),
    academicYear: text("academic_year"),
    englishLevel: text("english_level").notNull(),
    previousCourses: text("previous_courses"),
    whyLearn: text("why_learn"),
    difficulties: text("difficulties"),
    notes: text("notes"),
    privacyConsent: boolean("privacy_consent").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("students_phone_idx").on(t.whatsappNormalized)],
);

export const registrations = pgTable(
  "registrations",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "set null" }),
    courseSlug: text("course_slug").notNull(),
    schedule: text("schedule").notNull(),
    learningGoals: text("learning_goals").notNull(),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("registrations_student_idx").on(t.studentId)],
);

export const placementTestAttempts = pgTable("placement_test_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  governorate: text("governorate").notNull(),
  whatsapp: text("whatsapp").notNull(),
  phoneNormalized: text("phone_normalized").notNull().unique(),
  status: text("status").notNull().default("in_progress"),
  questionOrder: jsonb("question_order").$type<string[]>().notNull(),
  presentation: jsonb("presentation").$type<Record<string, Presentation>>().notNull(),
  currentIndex: integer("current_index").notNull().default(0),
  questionStartedAt: timestamp("question_started_at", { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  locale: text("locale").notNull().default("en"),
});

export const placementTestAnswers = pgTable(
  "placement_test_answers",
  {
    id: serial("id").primaryKey(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => placementTestAttempts.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    answer: jsonb("answer").$type<AnswerValue | null>(),
    timedOut: boolean("timed_out").notNull().default(false),
    savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("placement_answers_attempt_question").on(t.attemptId, t.questionId)],
);

export const placementTestResults = pgTable("placement_test_results", {
  id: serial("id").primaryKey(),
  attemptId: uuid("attempt_id")
    .notNull()
    .unique()
    .references(() => placementTestAttempts.id, { onDelete: "cascade" }),
  score: doublePrecision("score").notNull(),
  maxScore: integer("max_score").notNull().default(120),
  percentage: doublePrecision("percentage").notNull(),
  cefrLevel: text("cefr_level").notNull(),
  grade: text("grade").notNull(),
  strengths: jsonb("strengths").$type<string[]>().notNull(),
  weaknesses: jsonb("weaknesses").$type<string[]>().notNull(),
  recommendationsEn: jsonb("recommendations_en").$type<string[]>().notNull(),
  recommendationsAr: jsonb("recommendations_ar").$type<string[]>().notNull(),
  adviceEn: jsonb("advice_en").$type<string[]>().notNull(),
  adviceAr: jsonb("advice_ar").$type<string[]>().notNull(),
  recommendedCourseSlugs: jsonb("recommended_course_slugs").$type<string[]>().notNull(),
  breakdown: jsonb("breakdown").$type<BandBreakdown[]>().notNull(),
  reviews: jsonb("reviews").$type<StoredReview[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  affiliationEn: text("affiliation_en").notNull(),
  affiliationAr: text("affiliation_ar").notNull(),
  rating: integer("rating").notNull(),
  reviewEn: text("review_en").notNull(),
  reviewAr: text("review_ar").notNull(),
  initials: text("initials").notNull(),
  avatarHue: integer("avatar_hue").notNull().default(212),
  isDemo: boolean("is_demo").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const whatsappNotifications = pgTable("whatsapp_notifications", {
  id: serial("id").primaryKey(),
  confirmToken: uuid("confirm_token").notNull().defaultRandom(),
  kind: text("kind").notNull(),
  referenceId: text("reference_id").notNull(),
  recipient: text("recipient").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(),
  providerMessageId: text("provider_message_id"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type BandBreakdown = {
  level: string;
  earned: number;
  possible: number;
  accuracy: number;
};

export type StoredReview = {
  questionId: string;
  level: string;
  skill: string;
  type: string;
  stem: string;
  yourAnswer: string;
  solution: string;
  explanationEn: string;
  explanationAr: string;
  pointsEarned: number;
  pointsPossible: number;
  correct: boolean;
  partial: boolean;
};
