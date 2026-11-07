import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";

export type Session = { id: number; email: string; name: string; role: string; exp: number };

function secret() {
  const configured = process.env.SESSION_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production. Add a strong random value to your environment variables.");
  }
  return "fasla-local-development-only-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function encodeSession(session: Omit<Session, "exp">, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const payload = Buffer.from(JSON.stringify({ ...session, exp: Date.now() + maxAgeSeconds * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined | null): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function cookieBase() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: proto === "https",
    path: "/",
  };
}

export async function getSession() {
  const jar = await cookies();
  return decodeSession(jar.get("fasla_admin")?.value);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, session.id)).limit(1);
  if (!user) return null;
  return { ...session, role: user.role, email: user.email, name: user.name };
}
