import type { Metadata } from "next";
import { PlacementGate } from "@/components/PlacementGate";
import { PageShell } from "@/components/SiteChrome";
import { getPublicData } from "@/lib/public-data";
import { publicState, readAttemptCookie } from "@/lib/placement";

export const metadata: Metadata = {
  title: "Free English Placement Test",
  description: "Take FASLA's free 60-question English placement test and receive a CEFR level from A1 to C1.",
};

export default async function PlacementPage() {
  const data = await getPublicData();
  const token = await readAttemptCookie();
  const state = token ? await publicState(token) : null;
  const existing = state ? { token: token as string, status: state.status } : null;
  return (
    <PageShell courses={data.courses} settings={data.settings}>
      <PlacementGate existing={existing} />
    </PageShell>
  );
}
