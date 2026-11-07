"use client";

import { useI18n } from "@/components/LanguageProvider";

export function LegalView({ kind }: { kind: "privacy" | "terms" | "refund" }) {
  const { t } = useI18n();
  const doc = t.legal[kind];
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-navy">{doc.title}</h1>
      <p className="mt-3 text-sm text-black/50">{doc.updated}</p>
      <div className="mt-8 space-y-6">
        {doc.sections.map((section) => (
          <section key={section.h}>
            <h2 className="font-display text-2xl font-bold">{section.h}</h2>
            <p className="mt-2 leading-7 text-black/80">{section.b}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
