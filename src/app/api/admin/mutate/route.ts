import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, courses, placementTestAttempts, registrations, siteSettings, testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

async function admin() {
  const session = await requireAdmin();
  if (!session) return null;
  return session;
}

export async function POST(request: Request) {
  const session = await admin();
  if (!session) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const action = String(body.action ?? "");

  if (action === "updateCourse") {
    const id = Number(body.id);
    const priceValue = body.price === "" || body.price == null ? null : Number(body.price);
    if (!Number.isInteger(id)) return Response.json({ ok: false, error: "Invalid course." }, { status: 400 });
    if (priceValue != null && (!Number.isFinite(priceValue) || priceValue < 0)) {
      return Response.json({ ok: false, error: "Enter a valid price." }, { status: 400 });
    }
    await db
      .update(courses)
      .set({
        nameEn: String(body.nameEn ?? "").slice(0, 120),
        nameAr: String(body.nameAr ?? "").slice(0, 120),
        descriptionEn: String(body.descriptionEn ?? "").slice(0, 2000),
        descriptionAr: String(body.descriptionAr ?? "").slice(0, 2000),
        durationEn: String(body.durationEn ?? "").slice(0, 80),
        durationAr: String(body.durationAr ?? "").slice(0, 80),
        price: priceValue == null ? null : Math.round(priceValue * 100) / 100,
        contactPricing: Boolean(body.contactPricing),
        active: body.active !== false,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id));
    return Response.json({ ok: true });
  }

  if (action === "updateRegistration") {
    const id = Number(body.id);
    const status = String(body.status ?? "");
    if (!["new", "contacted", "enrolled", "waitlist", "closed"].includes(status)) {
      return Response.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    await db.update(registrations).set({ status }).where(eq(registrations.id, id));
    return Response.json({ ok: true });
  }

  if (action === "saveTestimonial") {
    const payload = {
      nameEn: String(body.nameEn ?? "").slice(0, 80),
      nameAr: String(body.nameAr ?? "").slice(0, 80),
      affiliationEn: String(body.affiliationEn ?? "").slice(0, 140),
      affiliationAr: String(body.affiliationAr ?? "").slice(0, 140),
      rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
      reviewEn: String(body.reviewEn ?? "").slice(0, 600),
      reviewAr: String(body.reviewAr ?? "").slice(0, 600),
      initials: String(body.initials ?? "FA").slice(0, 3).toUpperCase(),
      avatarHue: Number(body.avatarHue) || 212,
      isDemo: Boolean(body.isDemo),
      active: body.active !== false,
      sortOrder: Number(body.sortOrder) || 0,
    };
    if (payload.nameEn.length < 2 || payload.reviewEn.length < 8) {
      return Response.json({ ok: false, error: "Name and review are required." }, { status: 400 });
    }
    const id = Number(body.id);
    if (Number.isInteger(id) && id > 0) {
      await db.update(testimonials).set(payload).where(eq(testimonials.id, id));
    } else {
      await db.insert(testimonials).values(payload);
    }
    return Response.json({ ok: true });
  }

  if (action === "deleteTestimonial") {
    await db.delete(testimonials).where(eq(testimonials.id, Number(body.id)));
    return Response.json({ ok: true });
  }

  if (action === "updateSettings") {
    const entries = body.settings;
    if (!entries || typeof entries !== "object") return Response.json({ ok: false, error: "Invalid settings." }, { status: 400 });
    for (const [key, value] of Object.entries(entries as Record<string, unknown>)) {
      if (!/^[a-z0-9_]+$/.test(key)) continue;
      await db
        .insert(siteSettings)
        .values({ key, value: String(value ?? "").slice(0, 300) })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: String(value ?? "").slice(0, 300) } });
    }
    return Response.json({ ok: true });
  }

  if (action === "resetAttempt") {
    if (session.role !== "admin") return Response.json({ ok: false, error: "Only an admin can reset an attempt." }, { status: 403 });
    const id = String(body.id ?? "");
    await db.delete(placementTestAttempts).where(eq(placementTestAttempts.id, id));
    return Response.json({ ok: true });
  }

  if (action === "changePassword") {
    const current = String(body.current ?? "");
    const next = String(body.next ?? "");
    if (next.length < 8) return Response.json({ ok: false, error: "Use at least 8 characters." }, { status: 400 });
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, session.id)).limit(1);
    if (!user || !verifyPassword(current, user.passwordHash)) {
      return Response.json({ ok: false, error: "Current password is incorrect." }, { status: 400 });
    }
    await db.update(adminUsers).set({ passwordHash: hashPassword(next) }).where(eq(adminUsers.id, user.id));
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
