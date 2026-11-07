import { publicState, isUuid } from "@/lib/placement";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!isUuid(token)) return Response.json({ ok: false, error: "Invalid attempt." }, { status: 400 });
  const state = await publicState(token);
  if (!state) return Response.json({ ok: false, error: "Attempt not found." }, { status: 404 });
  return Response.json({ ok: true, state });
}
