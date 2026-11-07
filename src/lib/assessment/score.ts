import type { BankQuestion } from "@/lib/assessment/bank";
import { LEVEL_POINTS, type AnswerValue, type Level, type Skill } from "@/lib/assessment/types";
import type { BandBreakdown, StoredReview } from "@/db/schema";

export function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[“”„"']/g, "")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\b7\b/g, "seven")
    .trim();
}

function escapeReg(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function writingRatio(text: string, required: string, minWords: number) {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const hasWord = new RegExp(`\\b${escapeReg(required)}\\b`, "i").test(trimmed);
  let ratio = 0;
  if (words.length >= minWords) ratio += 0.35;
  else if (words.length >= Math.ceil(minWords / 2)) ratio += 0.15;
  if (hasWord) ratio += 0.4;
  if (/^[A-Z]/.test(trimmed) && /[.?!]$/.test(trimmed)) ratio += 0.15;
  if (words.length >= minWords && hasWord) ratio += 0.1;
  if (!hasWord) ratio = Math.min(ratio, 0.45);
  return Math.min(1, Math.round(ratio * 100) / 100);
}

function listenRatio(expected: string, given: string) {
  const expectedWords = normalizeText(expected).split(" ").filter(Boolean);
  const givenWords = normalizeText(given).split(" ").filter(Boolean);
  if (!expectedWords.length || !givenWords.length) return 0;
  const pool = [...givenWords];
  let hits = 0;
  for (const word of expectedWords) {
    const index = pool.indexOf(word);
    if (index >= 0) {
      hits += 1;
      pool.splice(index, 1);
    }
  }
  return Math.round((hits / expectedWords.length) * 100) / 100;
}

function labelOf(items: { id: string; text: string }[] | undefined, id: string | undefined) {
  return items?.find((item) => item.id === id)?.text ?? "—";
}

export function evaluate(question: BankQuestion, answer: AnswerValue | null) {
  switch (question.type) {
    case "mcq": {
      const optionId = answer?.type === "mcq" ? answer.optionId : "";
      return {
        ratio: optionId && optionId === question.correctOptionId ? 1 : 0,
        yourAnswer: labelOf(question.options, optionId),
        solution: labelOf(question.options, question.correctOptionId),
      };
    }
    case "fill": {
      const text = answer?.type === "fill" ? answer.text : "";
      const ok = (question.accepted ?? []).some((item) => normalizeText(item) === normalizeText(text));
      return { ratio: ok ? 1 : 0, yourAnswer: text.trim() || "—", solution: question.accepted?.[0] ?? "" };
    }
    case "match": {
      const pairs = answer?.type === "match" ? answer.pairs : {};
      const keys = Object.keys(question.pairs ?? {});
      const correct = keys.filter((key) => pairs[key] === question.pairs?.[key]).length;
      const solution = keys.map((key) => `${labelOf(question.left, key)} → ${labelOf(question.right, question.pairs?.[key])}`).join("; ");
      const yourAnswer = keys
        .map((key) => `${labelOf(question.left, key)} → ${labelOf(question.right, pairs[key])}`)
        .join("; ");
      return { ratio: keys.length ? correct / keys.length : 0, yourAnswer: yourAnswer || "—", solution };
    }
    case "order": {
      const tokens = answer?.type === "order" ? answer.tokens : [];
      const expected = question.correctTokens ?? [];
      const ok = normalizeText(tokens.join(" ")) === normalizeText(expected.join(" "));
      return {
        ratio: ok ? 1 : 0,
        yourAnswer: tokens.join(" ") || "—",
        solution: expected.join(" "),
      };
    }
    case "error": {
      const index = answer?.type === "error" ? answer.index : null;
      const ok = index === question.errorIndex;
      return {
        ratio: ok ? 1 : 0,
        yourAnswer: index != null ? question.words?.[index] ?? "—" : "—",
        solution: question.errorIndex != null ? `${question.words?.[question.errorIndex]} → ${question.correction}` : "",
      };
    }
    case "scramble": {
      const text = answer?.type === "scramble" ? answer.text : "";
      const ok = normalizeText(text) === normalizeText(question.scramble ?? "");
      return { ratio: ok ? 1 : 0, yourAnswer: text.trim() || "—", solution: question.scramble ?? "" };
    }
    case "writing": {
      const text = answer?.type === "writing" ? answer.text : "";
      const ratio = writingRatio(text, question.requiredWord ?? "", question.minWords ?? 5);
      return { ratio, yourAnswer: text.trim() || "—", solution: question.model ?? "" };
    }
    case "listening": {
      const text = answer?.type === "listening" ? answer.text : "";
      const ratio = listenRatio(question.transcript ?? "", text);
      return { ratio, yourAnswer: text.trim() || "—", solution: question.transcript ?? "" };
    }
  }
}

export function roundScore(value: number) {
  return Math.round(value * 100) / 100;
}

export function gradeKey(percentage: number) {
  if (percentage >= 90) return "excellent";
  if (percentage >= 75) return "very_good";
  if (percentage >= 60) return "good";
  if (percentage >= 45) return "fair";
  return "developing";
}

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

export function estimateLevel(bands: BandBreakdown[]) {
  const accuracy = Object.fromEntries(bands.map((band) => [band.level, band.accuracy]));
  if ((accuracy.A1 ?? 0) < 0.6) return "Pre-A1";
  let level = "A1";
  const next = ["A2", "B1", "B2", "C1"];
  const previous = ["A1", "A2", "B1", "B2"];
  for (let index = 0; index < next.length; index += 1) {
    const band = next[index] ?? "A2";
    const prior = previous[index] ?? "A1";
    if ((accuracy[band] ?? 0) >= 0.6 && (accuracy[prior] ?? 0) >= 0.5) level = band;
    else break;
  }
  return level;
}

export function recommendSlugs(level: string, weaknesses: string[]) {
  const map: Record<string, string[]> = {
    "Pre-A1": ["a1-beginner", "grammar-mastery"],
    A1: ["a1-beginner", "speaking-mastery"],
    A2: ["a2-elementary", "grammar-mastery"],
    B1: ["b1-intermediate", "speaking-mastery"],
    B2: ["b2-upper-intermediate", "grammar-mastery"],
    C1: ["c1-advanced", "speaking-mastery"],
  };
  const slugs = [...(map[level] ?? ["a1-beginner"])];
  if (weaknesses.includes("grammar") && !slugs.includes("grammar-mastery")) slugs.push("grammar-mastery");
  if ((weaknesses.includes("listening") || weaknesses.includes("writing")) && !slugs.includes("speaking-mastery")) {
    slugs.push("speaking-mastery");
  }
  return slugs.slice(0, 3);
}

export function buildPlacementResult(
  ordered: BankQuestion[],
  answers: Map<string, AnswerValue | null>,
) {
  const reviews: StoredReview[] = ordered.map((question) => {
    const evaluated = evaluate(question, answers.get(question.id) ?? null);
    const possible = LEVEL_POINTS[question.level];
    const earned = roundScore(possible * evaluated.ratio);
    return {
      questionId: question.id,
      level: question.level,
      skill: question.skill,
      type: question.type,
      stem: question.stem,
      yourAnswer: evaluated.yourAnswer,
      solution: evaluated.solution,
      explanationEn: question.explanationEn,
      explanationAr: question.explanationAr,
      pointsEarned: earned,
      pointsPossible: possible,
      correct: evaluated.ratio >= 0.999,
      partial: evaluated.ratio > 0 && evaluated.ratio < 0.999,
    };
  });

  const bands: BandBreakdown[] = LEVELS.map((level) => {
    const items = reviews.filter((review) => review.level === level);
    const earned = roundScore(items.reduce((sum, item) => sum + item.pointsEarned, 0));
    const possible = roundScore(items.reduce((sum, item) => sum + item.pointsPossible, 0));
    return { level, earned, possible, accuracy: possible ? earned / possible : 0 };
  });

  const skillMap = new Map<Skill, { earned: number; possible: number }>();
  for (const review of reviews) {
    const skill = review.skill as Skill;
    const current = skillMap.get(skill) ?? { earned: 0, possible: 0 };
    current.earned += review.pointsEarned;
    current.possible += review.pointsPossible;
    skillMap.set(skill, current);
  }
  const skillRatios = [...skillMap.entries()].map(([skill, stats]) => ({
    skill,
    ratio: stats.possible ? stats.earned / stats.possible : 0,
  }));
  const strengths = skillRatios.filter((item) => item.ratio >= 0.7).map((item) => item.skill);
  const weaknesses = skillRatios.filter((item) => item.ratio < 0.6).map((item) => item.skill);
  const score = roundScore(reviews.reduce((sum, review) => sum + review.pointsEarned, 0));
  const percentage = roundScore((score / 120) * 100);
  const cefrLevel = estimateLevel(bands);
  const slugs = recommendSlugs(cefrLevel, weaknesses);

  const adviceEn = [
    `Your estimated CEFR level is ${cefrLevel}. A score of ${score} out of 120 is ${percentage}%.`,
    strengths.length
      ? `Keep building on your stronger skills: ${strengths.join(", ")}.`
      : "Your profile is still forming. Short daily practice will make the pattern clearer.",
    weaknesses.length
      ? `Give extra time to: ${weaknesses.join(", ")}.`
      : "No skill fell below the 60% weakness line. Stretch the lowest skill anyway so progress stays even.",
    "Study in short daily sessions, review every mistake on this report, and join the recommended FASLA course.",
  ];
  const adviceAr = [
    `مستواك التقديري وفق CEFR هو ${cefrLevel}. درجتك ${score} من 120، أي ${percentage}%.`,
    strengths.length
      ? `واصل البناء على مهاراتك الأقوى: ${strengths.join("، ")}.`
      : "ملفك ما زال في طور التكون. الممارسة اليومية القصيرة ستوضح النمط.",
    weaknesses.length
      ? `امنح وقتًا إضافيًا لـ: ${weaknesses.join("، ")}.`
      : "لم تنخفض أي مهارة تحت حد الضعف 60%. مع ذلك، درّب المهارة الأضعف حتى يظل التقدم متوازنًا.",
    "ذاكر في جلسات يومية قصيرة، وراجع كل خطأ في هذا التقرير، وانضم إلى دورة FASLA الموصى بها.",
  ];
  const recommendationsEn = [
    `Start with the ${cefrLevel} learning path recommended below.`,
    weaknesses.includes("grammar")
      ? "Add Grammar Mastery so accuracy becomes automatic."
      : "Use each unit checkpoint before moving on.",
    weaknesses.includes("listening") || weaknesses.includes("writing")
      ? "Add speaking and listening practice so recognition turns into production."
      : "Record yourself once a week and compare it with the model answers.",
  ];
  const recommendationsAr = [
    `ابدأ بمسار ${cefrLevel} الموصى به أدناه.`,
    weaknesses.includes("grammar")
      ? "أضف دورة إتقان القواعد حتى تصبح الدقة تلقائية."
      : "أكمل مراجعة كل وحدة قبل الانتقال إلى ما بعدها.",
    weaknesses.includes("listening") || weaknesses.includes("writing")
      ? "أضف تدريب التحدث والاستماع حتى يتحول الفهم إلى إنتاج."
      : "سجّل صوتك مرة أسبوعيًا وقارنه بالإجابات النموذجية.",
  ];

  return {
    score,
    maxScore: 120,
    percentage,
    cefrLevel,
    grade: gradeKey(percentage),
    strengths: strengths.length ? strengths : skillRatios.sort((a, b) => b.ratio - a.ratio).slice(0, 1).map((item) => item.skill),
    weaknesses,
    recommendationsEn,
    recommendationsAr,
    adviceEn,
    adviceAr,
    recommendedCourseSlugs: slugs,
    breakdown: bands,
    reviews,
  };
}

export function challengePerformance(score: number) {
  if (score >= 7) return "outstanding";
  if (score >= 5) return "strong";
  if (score >= 3) return "developing";
  return "foundation";
}

export function scoreChallenge(questions: BankQuestion[], answers: Record<string, AnswerValue | null>) {
  const items = questions.map((question) => {
    const evaluated = evaluate(question, answers[question.id] ?? null);
    const correct = question.type === "writing" || question.type === "listening" ? evaluated.ratio >= 0.75 : evaluated.ratio >= 0.999;
    return {
      id: question.id,
      skill: question.skill,
      stem: question.stem,
      correct,
      yourAnswer: evaluated.yourAnswer,
      solution: evaluated.solution,
      explanationEn: question.explanationEn,
      explanationAr: question.explanationAr,
    };
  });
  const score = items.filter((item) => item.correct).length;
  const missed = items.filter((item) => !item.correct);
  const weakSkills = [...new Set(missed.map((item) => item.skill))];
  const recommendedSlugs =
    score <= 2 ? ["a1-beginner", "grammar-mastery"] : score <= 4 ? ["a2-elementary", "grammar-mastery"] : score <= 6 ? ["b1-intermediate", "speaking-mastery"] : ["b2-upper-intermediate", "speaking-mastery"];
  return {
    score,
    maxScore: 7,
    percentage: roundScore((score / 7) * 100),
    performance: challengePerformance(score),
    items,
    weaknesses: weakSkills,
    recommendedSlugs,
    recommendationsEn:
      score === 7
        ? ["Excellent control on this short challenge. Take the free placement test to confirm a full CEFR level.", "Speaking Mastery will keep fluency moving while you wait for your level report."]
        : [
            `You answered ${score} of 7 correctly.`,
            weakSkills.length ? `Review these areas: ${weakSkills.join(", ")}.` : "Review the solutions and try the placement test for a fuller picture.",
            "The recommended courses below match this short result. The 60-question placement test is the official level decision.",
          ],
    recommendationsAr:
      score === 7
        ? ["سيطرة ممتازة في هذا التحدي القصير. خض اختبار تحديد المستوى المجاني لتأكيد مستواك الكامل.", "دورة إتقان التحدث تحافظ على طلاقتك إلى أن يصلك تقرير المستوى."]
        : [
            `أجبت عن ${score} من 7 إجابات صحيحة.`,
            weakSkills.length ? `راجع هذه الجوانب: ${weakSkills.join("، ")}.` : "راجع الحلول ثم خض اختبار تحديد المستوى لصورة أوضح.",
            "الدورات الموصى بها تناسب هذه النتيجة القصيرة. اختبار الستين سؤالًا هو قرار المستوى الرسمي.",
          ],
  };
}
