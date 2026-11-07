import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ResultsReport } from "@/components/ResultsReport";
import { PageShell } from "@/components/SiteChrome";
import { db } from "@/db";
import { whatsappNotifications } from "@/db/schema";
import { normalizeEgyptPhone } from "@/lib/phone";
import { isUuid, publicState } from "@/lib/placement";
import { deliveryFromRecord, ensurePlacementReport } from "@/lib/placement-report";
import { getPublicData } from "@/lib/public-data";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Placement Report", robots: { index: false, follow: false } };

export default async function ResultsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isUuid(token)) notFound();
  const state = await publicState(token);
  if (!state) notFound();
  if (state.status !== "completed" || !state.result) redirect(`/placement/test/${token}`);
  const h = await headers();
  const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  await ensurePlacementReport(token, host ? `${proto}://${host}` : "");
  const [notice] = await db
    .select()
    .from(whatsappNotifications)
    .where(and(eq(whatsappNotifications.kind, "placement"), eq(whatsappNotifications.referenceId, token)))
    .limit(1);
  const [data, settings] = await Promise.all([getPublicData(), getSettings()]);
  const recommended = data.courses.filter((course) => state.result?.recommendedCourseSlugs.includes(course.slug));
  const result = state.result;
  return (
    <PageShell courses={data.courses} settings={data.settings}>
      <ResultsReport
        student={{ fullName: state.attempt.fullName, age: state.attempt.age, governorate: state.attempt.governorate, whatsapp: state.attempt.whatsapp }}
        score={result.score}
        maxScore={result.maxScore}
        percentage={result.percentage}
        cefrLevel={result.cefrLevel}
        grade={result.grade}
        strengths={result.strengths}
        weaknesses={result.weaknesses}
        adviceEn={result.adviceEn}
        adviceAr={result.adviceAr}
        breakdown={result.breakdown}
        reviews={result.reviews}
        courses={recommended}
        delivery={notice ? deliveryFromRecord(notice, normalizeEgyptPhone(settings.whatsapp_number) || "201201847164") : null}
      />
    </PageShell>
  );
}
