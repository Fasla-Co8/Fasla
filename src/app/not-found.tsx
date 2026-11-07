"use client";

import Link from "next/link";
import { LanguageSwitch } from "@/components/SiteChrome";
import { useI18n } from "@/components/LanguageProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="relative grid min-h-screen place-items-center bg-navy px-6 text-center text-white">
      <div className="absolute end-5 top-5"><LanguageSwitch /></div>
      <div>
        <h1 className="font-display text-4xl font-bold">{t.notFound.title}</h1>
        <p className="mt-4 text-white/75">{t.notFound.body}</p>
        <Link href="/" className="mt-6 inline-block bg-cta px-5 py-3 font-semibold text-navy">{t.common.backHome}</Link>
      </div>
    </main>
  );
}
