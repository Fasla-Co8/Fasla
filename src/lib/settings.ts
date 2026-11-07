import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export const DEFAULT_SETTINGS: Record<string, string> = {
  email: "fasla.english.ceo@gmail.com",
  whatsapp_number: "01201847164",
  location_en: "Cairo, Egypt",
  location_ar: "القاهرة، مصر",
  tiktok: "https://www.tiktok.com/@fasla.english.eg",
  instagram: "https://www.instagram.com/fasla.english",
  facebook: "https://www.facebook.com/people/Fasla/61589018621127/",
  whatsapp: "https://chat.whatsapp.com/KxqR1wpp4wB1m4uwKectEq",
  telegram: "https://t.me/+wseHmdcLIKg2ODJk",
  youtube: "https://www.youtube.com/@Fasla-English",
  linkedin: "",
  x: "",
};

// Former starter links are migrated once; later admin edits are preserved.
export const LEGACY_SOCIAL_DEFAULTS: Record<string, string> = {
  tiktok: "https://www.tiktok.com/@fasla.english",
  instagram: "https://www.instagram.com/fasla.english",
  whatsapp: "https://wa.me/201201847164",
  telegram: "https://t.me/faslaenglish",
  linkedin: "https://www.linkedin.com/company/fasla",
  youtube: "https://www.youtube.com/@faslaenglish",
  x: "https://x.com/faslaenglish",
};

export async function getSettings() {
  const rows = await db.select().from(siteSettings);
  return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((row) => [row.key, row.value])) };
}

export async function getSetting(key: string) {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return row?.value ?? DEFAULT_SETTINGS[key] ?? "";
}
