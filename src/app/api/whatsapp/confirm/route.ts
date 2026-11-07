import { eq } from "drizzle-orm";
import { db } from "@/db";
import { whatsappNotifications } from "@/db/schema";
import { isUuid } from "@/lib/placement";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { confirmToken?: string } | null;
  if (!body?.confirmToken || !isUuid(body.confirmToken)) {
    return Response.json({ ok: false, error: "Invalid confirmation." }, { status: 400 });
  }
  const [row] = await db.select().from(whatsappNotifications).where(eq(whatsappNotifications.confirmToken, body.confirmToken)).limit(1);
  if (!row) return Response.json({ ok: false, error: "Report not found." }, { status: 404 });
  if (row.status === "sent") {
    return Response.json({ ok: true, status: "sent", delivered: true });
  }
  await db
    .update(whatsappNotifications)
    .set({ status: "confirmed_by_student", updatedAt: new Date() })
    .where(eq(whatsappNotifications.id, row.id));
  return Response.json({ ok: true, status: "confirmed_by_student", delivered: false, confirmed: true });
}
