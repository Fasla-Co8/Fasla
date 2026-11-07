import { finalizeAttempt, isUuid, publicState } from "@/lib/placement";
import { ensurePlacementReport } from "@/lib/placement-report";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  if (!body?.token || !isUuid(body.token)) return Response.json({ ok: false, error: "Invalid attempt." }, { status: 400 });
  const result = await finalizeAttempt(body.token);
  if (!result) return Response.json({ ok: false, error: "Attempt not found." }, { status: 404 });
  const origin = requestOrigin(request);
  await ensurePlacementReport(body.token, origin);
  const state = await publicState(body.token);
  return Response.json({ ok: true, state, resultId: result.id });
}

function requestOrigin(request: Request) {
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  return host ? `${proto}://${host}` : "";
}
