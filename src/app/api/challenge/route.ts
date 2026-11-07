import { buildPresentation, challengeById, challengeQuestions, toPublic } from "@/lib/assessment/bank";
import { scoreChallenge } from "@/lib/assessment/score";
import type { AnswerValue } from "@/lib/assessment/types";

export async function GET() {
  const seed = `challenge-${new Date().toISOString().slice(0, 10)}`;
  return Response.json({
    ok: true,
    questions: challengeQuestions.map((question) => toPublic(question, buildPresentation(question, `${seed}:${question.id}`))),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { answers?: Record<string, AnswerValue> } | null;
  const answers = body?.answers ?? {};
  const missing = challengeQuestions.some((question) => !challengeById.has(question.id));
  if (missing) return Response.json({ ok: false, error: "Question bank error." }, { status: 500 });
  return Response.json({ ok: true, result: scoreChallenge(challengeQuestions, answers) });
}
