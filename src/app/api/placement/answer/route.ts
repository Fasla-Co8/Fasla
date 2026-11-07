import { eq } from "drizzle-orm";
import { db } from "@/db";
import { placementTestAnswers, placementTestAttempts } from "@/db/schema";
import type { AnswerValue } from "@/lib/assessment/types";
import { finalizeAttempt, isUuid, loadAttempt, publicState } from "@/lib/placement";
import { ensurePlacementReport } from "@/lib/placement-report";

function isAnswer(value: unknown): value is AnswerValue {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  const type = (value as { type: string }).type;
  return ["mcq", "fill", "match", "order", "error", "scramble", "writing", "listening"].includes(type);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: string;
    questionId?: string;
    answer?: unknown;
    advance?: boolean;
    expectedIndex?: number;
    timedOut?: boolean;
  } | null;
  if (!body?.token || !isUuid(body.token) || !body.questionId) {
    return Response.json({ ok: false, error: "Invalid attempt." }, { status: 400 });
  }
  const attempt = await loadAttempt(body.token);
  if (!attempt) return Response.json({ ok: false, error: "Attempt not found." }, { status: 404 });
  if (attempt.status === "completed") {
    return Response.json({ ok: true, state: await publicState(body.token) });
  }
  if (attempt.currentIndex !== body.expectedIndex) {
    return Response.json({ ok: true, resynced: true, state: await publicState(body.token) });
  }
  const currentId = attempt.questionOrder[attempt.currentIndex];
  if (currentId !== body.questionId) {
    return Response.json({ ok: true, resynced: true, state: await publicState(body.token) });
  }
  const answer = isAnswer(body.answer) ? body.answer : null;
  await db
    .insert(placementTestAnswers)
    .values({
      attemptId: attempt.id,
      questionId: body.questionId,
      answer,
      timedOut: Boolean(body.timedOut),
    })
    .onConflictDoUpdate({
      target: [placementTestAnswers.attemptId, placementTestAnswers.questionId],
      set: { answer, timedOut: Boolean(body.timedOut), savedAt: new Date() },
    });

  if (!body.advance) return Response.json({ ok: true, state: await publicState(body.token) });

  const nextIndex = attempt.currentIndex + 1;
  if (nextIndex >= attempt.questionOrder.length) {
    await db
      .update(placementTestAttempts)
      .set({ currentIndex: attempt.questionOrder.length })
      .where(eq(placementTestAttempts.id, attempt.id));
    await finalizeAttempt(attempt.id);
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    await ensurePlacementReport(attempt.id, host ? `${proto}://${host}` : "");
    return Response.json({ ok: true, state: await publicState(body.token) });
  }
  await db
    .update(placementTestAttempts)
    .set({ currentIndex: nextIndex, questionStartedAt: new Date() })
    .where(eq(placementTestAttempts.id, attempt.id));
  return Response.json({ ok: true, state: await publicState(body.token) });
}
