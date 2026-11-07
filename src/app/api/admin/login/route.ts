import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { cookieBase, encodeSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`login:${clientIp(request)}`, 8, 15 * 60 * 1000)) {
    return Response.json({ ok: false, error: "Too many login attempts. Wait 15 minutes." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  if (!email || !password) return Response.json({ ok: false, error: "Enter your email and password." }, { status: 400 });
  await ensureSeed();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
  }
  const jar = await cookies();
  const base = await cookieBase();
  jar.set("fasla_admin", encodeSession({ id: user.id, email: user.email, name: user.name, role: user.role }), {
    ...base,
    maxAge: 60 * 60 * 24 * 7,
  });
  return Response.json({ ok: true, name: user.name, role: user.role });
}
