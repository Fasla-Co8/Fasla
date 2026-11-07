"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { FaslaLogo } from "@/components/Logo";
import { useI18n } from "@/components/LanguageProvider";
import { localized, originalPriceLabel, priceLabel } from "@/lib/format";
import type { CourseDTO, PublicSettings } from "@/lib/types";

export function LanguageSwitch({ tone = "light" }: { tone?: "light" | "dark" | "yellow" }) {
  const { lang, setLang, t } = useI18n();
  const color = tone === "light" ? "text-white" : tone === "yellow" ? "text-navy" : "text-navy";
  return (
    <div className={`flex items-center gap-2 text-sm font-semibold ${color}`} aria-label={t.common.language}>
      <button type="button" onClick={() => setLang("en")} className={lang === "en" ? "underline decoration-2 underline-offset-4" : "opacity-70"} aria-pressed={lang === "en"}>
        EN
      </button>
      <span aria-hidden="true">|</span>
      <button type="button" onClick={() => setLang("ar")} className={lang === "ar" ? "underline decoration-2 underline-offset-4" : "opacity-70"} aria-pressed={lang === "ar"}>
        AR
      </button>
    </div>
  );
}

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/courses", label: t.nav.courses },
    { href: "/#challenge", label: t.nav.challenge },
    { href: "/placement", label: t.nav.placement },
    { href: "/register", label: t.nav.register },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="FASLA" className="w-14 shrink-0 sm:w-16">
          <FaslaLogo variant="light" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? "text-cta" : "text-white/90 hover:text-white"}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitch />
          <button type="button" className="text-sm font-semibold md:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
            {open ? t.nav.close : t.nav.menu}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="grid gap-3 border-t border-white/10 px-4 py-4 text-sm font-semibold md:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

const socialLinks = [
  { key: "tiktok", label: "TikTok", Icon: FaTiktok },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp },
  { key: "telegram", label: "Telegram", Icon: FaTelegram },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "x", label: "X", Icon: FaXTwitter },
] as const;

export function Footer({ courses, settings }: { courses: CourseDTO[]; settings: PublicSettings }) {
  const { lang, t } = useI18n();
  const location = lang === "ar" ? settings.location_ar : settings.location_en;
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="w-40">
            <FaslaLogo variant="light" />
          </div>
          <p className="mt-4 text-sm leading-7 text-white/75">{t.footer.blurb}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-beige">{t.footer.quick}</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li><Link href="/">{t.nav.home}</Link></li>
            <li><Link href="/courses">{t.nav.courses}</Link></li>
            <li><Link href="/#challenge">{t.nav.challenge}</Link></li>
            <li><Link href="/placement">{t.nav.placement}</Link></li>
            <li><Link href="/register">{t.nav.register}</Link></li>
            <li><Link href="/admin">{t.nav.admin}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-beige">{t.footer.courses}</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {courses.map((course) => (
              <li key={course.slug}>
                <Link href={`/courses/${course.slug}`}>{localized(lang, course.nameEn, course.nameAr)}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-beige">{t.footer.contact}</h2>
          <ul className="mt-4 grid gap-2 text-sm leading-6">
            <li>{t.footer.whatsapp}: {settings.whatsapp_number || "01201847164"}</li>
            <li>
              <a href={`mailto:${settings.email || "fasla.english.ceo@gmail.com"}`} className="break-all transition-colors hover:text-cta">
                {settings.email || "fasla.english.ceo@gmail.com"}
              </a>
            </li>
            <li>{location}</li>
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-2" aria-label={lang === "ar" ? "حسابات FASLA على السوشيال ميديا" : "FASLA social media"}>
            {socialLinks.map(({ key, label, Icon }) =>
              settings[key] ? (
                <a
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/85 transition-colors hover:bg-white/10 hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </a>
              ) : null,
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-white/70">
          <p>{t.footer.rights}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy">{t.footer.privacy}</Link>
            <Link href="/terms">{t.footer.terms}</Link>
            <Link href="/refund">{t.footer.refund}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({
  courses,
  settings,
  children,
}: {
  courses: CourseDTO[];
  settings: PublicSettings;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer courses={courses} settings={settings} />
    </>
  );
}

export function CoursesIntro() {
  const { t } = useI18n();
  return (
    <div>
      <h1 className="font-display text-4xl font-bold text-navy">{t.courses.pageTitle}</h1>
      <p className="mt-3 max-w-2xl leading-7 text-black/70">{t.courses.pageIntro}</p>
    </div>
  );
}

export function CourseCard({ course }: { course: CourseDTO }) {
  const { lang, t } = useI18n();
  const skills = lang === "ar" ? course.skillsAr : course.skillsEn;
  const units = course.unitsLabelEn ? localized(lang, course.unitsLabelEn, course.unitsLabelAr || course.unitsLabelEn) : String(course.units);
  const lessons = course.lessonsLabelEn ? localized(lang, course.lessonsLabelEn, course.lessonsLabelAr || course.lessonsLabelEn) : String(course.lessons);
  const originalPrice = originalPriceLabel(course, lang);
  return (
    <article className="flex w-full max-w-sm flex-col border border-black/10 bg-white p-6 text-ink">
      <div className="-mx-6 -mt-6 mb-5 bg-cta px-6 py-2 text-center text-sm font-extrabold text-navy">
        {t.courses.discount}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{course.cefr}</p>
      <h3 className="mt-2 font-display text-2xl font-bold">{localized(lang, course.nameEn, course.nameAr)}</h3>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-black/75">{localized(lang, course.descriptionEn, course.descriptionAr)}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-black/50">{t.courses.duration}</dt><dd className="font-semibold">{localized(lang, course.durationEn, course.durationAr)}</dd></div>
        <div><dt className="text-black/50">{t.courses.units}</dt><dd className="font-semibold">{units}</dd></div>
        <div><dt className="text-black/50">{t.courses.lessons}</dt><dd className="font-semibold">{lessons}</dd></div>
        <div>
          <dt className="text-black/50">{t.courses.price}</dt>
          <dd className="font-semibold">
            {originalPrice ? <span className="me-2 text-xs font-normal text-black/45 line-through">{originalPrice}</span> : null}
            <span>{priceLabel(course, lang)}</span>
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-black/45">{t.courses.skills}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {skills.slice(0, 4).map((skill) => (
          <li key={skill} className="border border-black/10 px-2 py-1 text-xs">{skill}</li>
        ))}
      </ul>
      <div className="mt-6 grid gap-2">
        <Link href={`/courses/${course.slug}`} className="border border-ink px-4 py-3 text-center text-sm font-semibold">
          {t.courses.details}
        </Link>
        <Link href={`/register?course=${course.slug}`} className="bg-cta px-4 py-3 text-center text-sm font-semibold text-navy">
          {t.courses.register}
        </Link>
      </div>
    </article>
  );
}

export type DeliveryState = {
  notificationId: number;
  confirmToken: string;
  delivered: boolean;
  requiresConfirmation: boolean;
  status: string;
  confirmed?: boolean;
  url: string;
  message: string;
  error?: string | null;
};

export function WhatsAppPanel({ delivery }: { delivery: DeliveryState }) {
  const { t } = useI18n();
  const [status, setStatus] = useState(delivery.status);
  const [pending, setPending] = useState(false);
  async function confirm() {
    setPending(true);
    const response = await fetch("/api/whatsapp/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmToken: delivery.confirmToken }),
    });
    const data = (await response.json()) as { status?: string };
    if (data.status) setStatus(data.status);
    setPending(false);
  }
  return (
    <section className="border border-black/10 bg-white p-5">
      <h3 className="font-display text-xl font-bold">WhatsApp</h3>
      {status === "sent" || delivery.delivered ? (
        <p className="mt-3 text-sm leading-6 text-leaf">{t.whatsapp.delivered}</p>
      ) : status === "confirmed_by_student" ? (
        <p className="mt-3 text-sm leading-6">{t.whatsapp.confirmed}</p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6">{t.whatsapp.pending}</p>
          {delivery.error ? <p className="mt-2 text-xs text-black/60">{delivery.error}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={delivery.url} target="_blank" rel="noreferrer" className="bg-leaf px-4 py-3 text-sm font-semibold text-white">
              {t.whatsapp.open}
            </a>
            <button type="button" onClick={confirm} disabled={pending} className="border border-ink px-4 py-3 text-sm font-semibold">
              {t.whatsapp.confirm}
            </button>
          </div>
        </>
      )}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold">{t.whatsapp.preview}</summary>
        <pre className="mt-3 whitespace-pre-wrap text-xs leading-5 text-black/70">{delivery.message}</pre>
      </details>
    </section>
  );
}
