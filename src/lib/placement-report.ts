import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, placementTestAttempts, placementTestResults, whatsappNotifications } from "@/db/schema";
import { displayEgyptPhone } from "@/lib/phone";
import { deliverWhatsApp } from "@/lib/whatsapp";

export async function ensurePlacementReport(token: string, origin: string) {
  const [existing] = await db
    .select()
    .from(whatsappNotifications)
    .where(and(eq(whatsappNotifications.kind, "placement"), eq(whatsappNotifications.referenceId, token)))
    .limit(1);
  if (existing) return existing;

  const [attempt] = await db.select().from(placementTestAttempts).where(eq(placementTestAttempts.id, token)).limit(1);
  const [result] = await db.select().from(placementTestResults).where(eq(placementTestResults.attemptId, token)).limit(1);
  if (!attempt || !result || attempt.status !== "completed") return null;

  const courseRows = await db.select().from(courses);
  const names = result.recommendedCourseSlugs
    .map((slug) => courseRows.find((course) => course.slug === slug)?.nameEn ?? slug)
    .join(", ");
  const incorrect = result.reviews
    .filter((review) => !review.correct)
    .slice(0, 12)
    .map((review, index) => `${index + 1}. ${review.stem}\nYour answer: ${review.yourAnswer}\nSolution: ${review.solution}`)
    .join("\n");
  const reportUrl = origin ? `${origin}/placement/results/${token}` : "";
  const message = [
    "FASLA Placement Report",
    `Name: ${attempt.fullName}`,
    `Age: ${attempt.age}`,
    `Governorate: ${attempt.governorate}`,
    `WhatsApp: ${attempt.whatsapp}`,
    `Score: ${result.score} / ${result.maxScore}`,
    `Percentage: ${result.percentage}%`,
    `Estimated CEFR level: ${result.cefrLevel}`,
    `Grade: ${result.grade}`,
    `Strengths: ${result.strengths.join(", ") || "—"}`,
    `Weaknesses: ${result.weaknesses.join(", ") || "None below 60%"}`,
    `Recommended courses: ${names || "—"}`,
    "Advice:",
    ...result.adviceEn,
    "Incorrect answers:",
    incorrect || "None.",
    reportUrl ? `Full report: ${reportUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await deliverWhatsApp({ kind: "placement", referenceId: token, message });
  const [saved] = await db
    .select()
    .from(whatsappNotifications)
    .where(and(eq(whatsappNotifications.kind, "placement"), eq(whatsappNotifications.referenceId, token)))
    .limit(1);
  return saved ?? null;
}

export function deliveryFromRecord(record: typeof whatsappNotifications.$inferSelect, recipient = "201201847164") {
  const to = recipient.replace(/\D/g, "");
  return {
    notificationId: record.id,
    confirmToken: record.confirmToken,
    delivered: record.status === "sent",
    requiresConfirmation: record.status !== "sent",
    status: record.status,
    confirmed: record.status === "confirmed_by_student",
    url: `https://wa.me/${to}?text=${encodeURIComponent(record.message)}`,
    message: record.message,
    error: record.error,
  };
}

void displayEgyptPhone;
