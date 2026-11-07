import type { Metadata } from "next";
import { RegisterForm } from "@/components/RegisterForm";
import { PageShell } from "@/components/SiteChrome";
import { getPublicData } from "@/lib/public-data";

export const metadata: Metadata = { title: "Join FASLA", description: "Register for a FASLA English course." };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course } = await searchParams;
  const data = await getPublicData();
  return (
    <PageShell courses={data.courses} settings={data.settings}>
      <RegisterForm courses={data.courses} initialCourse={course ?? ""} />
    </PageShell>
  );
}
