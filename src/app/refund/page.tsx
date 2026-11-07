import type { Metadata } from "next";
import { LegalView } from "@/components/LegalView";
import { PageShell } from "@/components/SiteChrome";
import { getPublicData } from "@/lib/public-data";

export const metadata: Metadata = { title: "Refund Policy" };

export default async function RefundPage() {
  const data = await getPublicData();
  return <PageShell courses={data.courses} settings={data.settings}><LegalView kind="refund" /></PageShell>;
}
