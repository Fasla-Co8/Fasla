import { eq } from "drizzle-orm";
import { db } from "@/db";
import { placementTestAttempts } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { GOVERNORATE_KEYS } from "@/lib/governorates";
import { normalizeEgyptPhone } from "@/lib/phone";
import { newAttemptOrder, presentationFor, publicState, rememberAttempt } from "@/lib/placement";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`placement:${clientIp(request)}`, 20, 60 * 60 * 1000)) {
    return Response.json({ ok: false, error: "Too many attempts from this network. Try again later." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const age = Number(body.age);
  const governorate = typeof body.governorate === "string" ? body.governorate : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
  const locale = body.locale === "ar" ? "ar" : "en";
  const phone = normalizeEgyptPhone(whatsapp);
  if (fullName.length < 3 || fullName.length > 80) return Response.json({ ok: false, error: "Enter your full name." }, { status: 400 });
  if (!Number.isInteger(age) || age < 8 || age > 90) return Response.json({ ok: false, error: "Enter a valid age." }, { status: 400 });
  if (!GOVERNORATE_KEYS.has(governorate as never)) return Response.json({ ok: false, error: "Select a governorate." }, { status: 400 });
  if (!phone) return Response.json({ ok: false, error: "Enter a valid Egyptian WhatsApp number." }, { status: 400 });
  if (body.acknowledged !== true) return Response.json({ ok: false, error: "Confirm that you understand the one-attempt rule." }, { status: 400 });

  await ensureSeed();
  const [existing] = await db.select().from(placementTestAttempts).where(eq(placementTestAttempts.phoneNormalized, phone)).limit(1);
  if (existing) {
    await rememberAttempt(existing.id);
    const state = await publicState(existing.id);
    return Response.json({
      ok: true,
      resumed: existing.status !== "completed",
      alreadyCompleted: existing.status === "completed",
      token: existing.id,
      state,
    });
  }

  const order = newAttemptOrder();
  try {
    const [created] = await db
      .insert(placementTestAttempts)
      .values({
        fullName,
        age,
        governorate,
        whatsapp,
        phoneNormalized: phone,
        status: "in_progress",
        questionOrder: order,
        presentation: presentationFor(order, phone),
        currentIndex: 0,
        locale,
      })
      .returning();
    if (!created) return Response.json({ ok: false, error: "Could not start the test." }, { status: 500 });
    await rememberAttempt(created.id);
    return Response.json({ ok: true, resumed: false, alreadyCompleted: false, token: created.id, state: await publicState(created.id) });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
    if (code === "23505") {
      const [again] = await db.select().from(placementTestAttempts).where(eq(placementTestAttempts.phoneNormalized, phone)).limit(1);
      if (again) {
        await rememberAttempt(again.id);
        return Response.json({
          ok: true,
          resumed: again.status !== "completed",
          alreadyCompleted: again.status === "completed",
          token: again.id,
          state: await publicState(again.id),
        });
      }
    }
    return Response.json({ ok: false, error: "Could not start the test." }, { status: 500 });
  }
}
