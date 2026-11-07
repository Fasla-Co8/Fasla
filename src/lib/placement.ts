import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { placementTestAnswers, placementTestAttempts, placementTestResults, type StoredReview } from "@/db/schema";
import { buildPresentation, placementById, placementQuestions, toPublic } from "@/lib/assessment/bank";
import { buildPlacementResult } from "@/lib/assessment/score";
import { secondsFor, type AnswerValue, type PublicQuestion } from "@/lib/assessment/types";
import { cookieBase } from "@/lib/auth";
import { seededShuffle } from "@/lib/assessment/bank";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_RE.test(value);
}

export async function rememberAttempt(token: string) {
  const jar = await cookies();
  const base = await cookieBase();
  jar.set("fasla_attempt", token, { ...base, maxAge: 60 * 60 * 24 * 30 });
}

export async function readAttemptCookie() {
  const jar = await cookies();
  return jar.get("fasla_attempt")?.value ?? null;
}

function remainingSeconds(startedAt: Date, type: PublicQuestion["type"]) {
  const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
  return Math.max(0, secondsFor(type) - elapsed);
}

export async function loadAttempt(token: string) {
  if (!isUuid(token)) return null;
  const [attempt] = await db.select().from(placementTestAttempts).where(eq(placementTestAttempts.id, token)).limit(1);
  return attempt ?? null;
}

export async function loadAnswers(token: string) {
  const rows = await db.select().from(placementTestAnswers).where(eq(placementTestAnswers.attemptId, token));
  return new Map(rows.map((row) => [row.questionId, row.answer]));
}

export function currentQuestion(attempt: typeof placementTestAttempts.$inferSelect) {
  const id = attempt.questionOrder[attempt.currentIndex];
  if (!id) return null;
  const question = placementById.get(id);
  if (!question) return null;
  return toPublic(question, attempt.presentation[id]);
}

export async function publicState(token: string) {
  const attempt = await loadAttempt(token);
  if (!attempt) return null;
  if (attempt.status === "completed") {
    const [result] = await db.select().from(placementTestResults).where(eq(placementTestResults.attemptId, token)).limit(1);
    return { status: "completed" as const, attempt, result: result ?? null };
  }
  const question = currentQuestion(attempt);
  const answers = await loadAnswers(token);
  const draft = question ? answers.get(question.id) ?? null : null;
  const finished = attempt.currentIndex >= attempt.questionOrder.length;
  return {
    status: "in_progress" as const,
    attempt,
    question,
    draft,
    finished,
    remainingSeconds: question ? remainingSeconds(attempt.questionStartedAt, question.type) : 0,
    total: attempt.questionOrder.length,
  };
}

export function newAttemptOrder() {
  const ids = seededShuffle(
    placementQuestions.map((question) => question.id),
    `${Date.now()}-${Math.random()}`,
  );
  return ids;
}

export function presentationFor(order: string[], seed: string) {
  const presentation: Record<string, ReturnType<typeof buildPresentation>> = {};
  for (const id of order) {
    const question = placementById.get(id);
    if (question) presentation[id] = buildPresentation(question, `${seed}:${id}`);
  }
  return presentation;
}

export async function finalizeAttempt(token: string) {
  const attempt = await loadAttempt(token);
  if (!attempt) return null;
  if (attempt.status === "completed") {
    const [existing] = await db.select().from(placementTestResults).where(eq(placementTestResults.attemptId, token)).limit(1);
    return existing ?? null;
  }
  const answers = await loadAnswers(token);
  const ordered = attempt.questionOrder.map((id) => placementById.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const answerMap = new Map<string, AnswerValue | null>();
  for (const question of ordered) answerMap.set(question.id, answers.get(question.id) ?? null);
  const scored = buildPlacementResult(ordered, answerMap);
  const [result] = await db
    .insert(placementTestResults)
    .values({
      attemptId: token,
      score: scored.score,
      maxScore: scored.maxScore,
      percentage: scored.percentage,
      cefrLevel: scored.cefrLevel,
      grade: scored.grade,
      strengths: scored.strengths,
      weaknesses: scored.weaknesses,
      recommendationsEn: scored.recommendationsEn,
      recommendationsAr: scored.recommendationsAr,
      adviceEn: scored.adviceEn,
      adviceAr: scored.adviceAr,
      recommendedCourseSlugs: scored.recommendedCourseSlugs,
      breakdown: scored.breakdown,
      reviews: scored.reviews as StoredReview[],
    })
    .onConflictDoNothing()
    .returning();
  await db
    .update(placementTestAttempts)
    .set({ status: "completed", completedAt: new Date(), currentIndex: attempt.questionOrder.length })
    .where(eq(placementTestAttempts.id, token));
  if (result) return result;
  const [existing] = await db.select().from(placementTestResults).where(eq(placementTestResults.attemptId, token)).limit(1);
  return existing ?? null;
}
