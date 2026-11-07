import { notFound, redirect } from "next/navigation";
import { TestRunner } from "@/components/TestRunner";
import { isUuid, publicState } from "@/lib/placement";

export default async function PlacementTestPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isUuid(token)) notFound();
  const state = await publicState(token);
  if (!state) notFound();
  if (state.status === "completed") redirect(`/placement/results/${token}`);
  return <TestRunner token={token} />;
}
