import { cookies } from "next/headers";
import { cookieBase } from "@/lib/auth";

export async function POST() {
  const jar = await cookies();
  const base = await cookieBase();
  jar.set("fasla_admin", "", { ...base, maxAge: 0 });
  return Response.json({ ok: true });
}
