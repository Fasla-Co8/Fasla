"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaslaLogo } from "@/components/Logo";
import { LanguageSwitch } from "@/components/SiteChrome";
import { useI18n } from "@/components/LanguageProvider";
import { localized } from "@/lib/format";
import { GOVERNORATES } from "@/lib/governorates";

type Overview = {
  session: { name: string; role: string; email: string };
  students: Record<string, unknown>[];
  registrations: Record<string, unknown>[];
  attempts: { id: string; fullName: string; whatsapp: string; status: string; currentIndex: number; total: number; governorate: string; age: number; startedAt: string }[];
  results: { attemptId: string; score: number; percentage: number; cefrLevel: string; grade: string; createdAt: string }[];
  courses: {
    id: number;
    slug: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    durationEn: string;
    durationAr: string;
    price: number | null;
    contactPricing: boolean;
    active: boolean;
  }[];
  testimonials: Record<string, unknown>[];
  notifications: { id: number; kind: string; recipient: string; status: string; error: string | null; createdAt: string; message: string }[];
  settings: Record<string, string>;
};

const tabs = ["overview", "students", "registrations", "results", "courses", "testimonials", "whatsapp", "settings"] as const;

function governorateLabel(value: string, lang: "en" | "ar") {
  const item = GOVERNORATES.find((entry) => entry.key === value);
  return item ? (lang === "ar" ? item.ar : item.key) : value;
}

export function AdminDashboard() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]>("overview");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/admin/overview");
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = (await response.json()) as Overview & { ok?: boolean };
    setData(json);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function mutate(body: Record<string, unknown>) {
    setError("");
    setNotice("");
    const response = await fetch("/api/admin/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await response.json()) as { ok?: boolean; error?: string };
    if (!json.ok) setError(json.error || t.common.error);
    else {
      setNotice(t.admin.save);
      await load();
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const labels: Record<(typeof tabs)[number], string> = {
    overview: t.admin.overview,
    students: t.admin.students,
    registrations: t.admin.registrations,
    results: t.admin.results,
    courses: t.admin.courses,
    testimonials: t.admin.testimonials,
    whatsapp: t.admin.whatsapp,
    settings: t.admin.settings,
  };

  const students = useMemo(() => {
    const rows = data?.students ?? [];
    const q = query.toLowerCase();
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [data, query]);

  if (!data) {
    return (
      <div className="relative grid min-h-screen place-items-center bg-navy text-white">
        <div className="absolute end-5 top-5"><LanguageSwitch /></div>
        {t.common.loading}
      </div>
    );
  }

  const registrationStatus = (value: string) => t.admin.statuses[value as keyof typeof t.admin.statuses] ?? value;
  const attemptStatus = (value: string) => t.admin.attemptStatuses[value as keyof typeof t.admin.attemptStatuses] ?? value;
  const scheduleLabel = (value: string) => t.schedules[value as keyof typeof t.schedules] ?? value;

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-ink">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="w-12 sm:w-14"><FaslaLogo variant="light" /></div>
          <div className="text-sm">
            <p className="font-semibold">{data.session.name}</p>
            <p className="text-white/60">{data.session.role === "admin" ? t.nav.admin : data.session.role}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitch />
            <button type="button" onClick={logout} className="text-sm font-semibold">{t.admin.logout}</button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-auto lg:flex-col">
          {tabs.map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={`px-3 py-2 text-start text-sm font-semibold ${tab === item ? "bg-navy text-white" : "bg-white"}`}>
              {labels[item]}
            </button>
          ))}
        </nav>
        <section className="min-w-0">
          {error ? <p className="mb-3 border border-red-200 bg-white p-3 text-sm text-red-700">{error}</p> : null}
          {notice ? <p className="mb-3 border border-leaf/30 bg-white p-3 text-sm text-leaf">{notice}</p> : null}
          {tab === "overview" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Tile label={t.admin.students} value={String(data.students.length)} />
              <Tile label={t.admin.registrations} value={String(data.registrations.length)} />
              <Tile label={t.admin.results} value={String(data.results.length)} />
              <Tile label={t.admin.whatsapp} value={String(data.notifications.filter((item) => item.status === "sent").length)} />
              <a href="/api/admin/export" className="bg-cta px-4 py-6 text-center font-semibold text-navy">{t.admin.export}</a>
            </div>
          ) : null}
          {tab === "students" ? (
            <div>
              <input className="field mb-4 max-w-sm" placeholder={t.admin.search} value={query} onChange={(event) => setQuery(event.target.value)} />
              <div className="overflow-auto bg-white">
                <table className="min-w-full text-start text-sm">
                  <thead className="bg-navy text-white"><tr><th className="p-3 text-start">{t.admin.name}</th><th className="p-3 text-start">{t.admin.whatsapp}</th><th className="p-3 text-start">{t.admin.governorate}</th><th className="p-3 text-start">{t.admin.email}</th></tr></thead>
                  <tbody>
                    {students.map((row) => (
                      <tr key={String(row.id)} className="border-t border-black/10">
                        <td className="p-3">{String(row.fullName)}</td>
                        <td className="p-3" dir="ltr">{String(row.whatsapp)}</td>
                        <td className="p-3">{governorateLabel(String(row.governorate), lang)}</td>
                        <td className="p-3">{String(row.email)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
          {tab === "registrations" ? (
            <div className="grid gap-3">
              {data.registrations.map((row) => {
                const course = data.courses.find((item) => item.slug === String(row.courseSlug));
                return (
                  <form key={String(row.id)} className="grid gap-3 bg-white p-4 md:grid-cols-[1fr_180px_auto]" onSubmit={(event) => { event.preventDefault(); const fd = new FormData(event.currentTarget); void mutate({ action: "updateRegistration", id: row.id, status: fd.get("status") }); }}>
                    <div>
                      <p className="font-semibold">{course ? localized(lang, course.nameEn, course.nameAr) : String(row.courseSlug)}</p>
                      <p className="text-xs text-black/50">#{String(row.id)} · {t.admin.student} {String(row.studentId)} · {scheduleLabel(String(row.schedule))}</p>
                    </div>
                    <select name="status" className="field" defaultValue={String(row.status)} aria-label={t.admin.status}>
                      {(["new", "contacted", "enrolled", "waitlist", "closed"] as const).map((status) => <option key={status} value={status}>{registrationStatus(status)}</option>)}
                    </select>
                    <button className="bg-navy px-4 py-2 text-sm font-semibold text-white" type="submit">{t.admin.save}</button>
                  </form>
                );
              })}
            </div>
          ) : null}
          {tab === "results" ? (
            <div className="grid gap-3">
              {data.attempts.map((attempt) => {
                const result = data.results.find((item) => item.attemptId === attempt.id);
                return (
                  <article key={attempt.id} className="bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{attempt.fullName}</p>
                        <p className="text-sm text-black/60"><span dir="ltr">{attempt.whatsapp}</span> · {governorateLabel(attempt.governorate, lang)} · {attemptStatus(attempt.status)} · {attempt.currentIndex}/{attempt.total}</p>
                        {result ? <p className="mt-2 text-sm">{result.cefrLevel} · {result.score}/120 · {result.percentage}% · {t.grades[result.grade as keyof typeof t.grades] ?? result.grade}</p> : null}
                      </div>
                      <button type="button" className="border border-ink px-3 py-2 text-sm" onClick={() => mutate({ action: "resetAttempt", id: attempt.id })}>{t.admin.reset}</button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
          {tab === "courses" ? (
            <div className="grid gap-4">
              {data.courses.map((course) => (
                <form key={course.id} className="grid gap-3 bg-white p-4" onSubmit={(event) => {
                  event.preventDefault();
                  const fd = new FormData(event.currentTarget);
                  void mutate({
                    action: "updateCourse",
                    id: course.id,
                    nameEn: fd.get("nameEn"),
                    nameAr: fd.get("nameAr"),
                    descriptionEn: fd.get("descriptionEn"),
                    descriptionAr: fd.get("descriptionAr"),
                    durationEn: fd.get("durationEn"),
                    durationAr: fd.get("durationAr"),
                    price: fd.get("price"),
                    contactPricing: fd.get("contactPricing") === "on",
                    active: fd.get("active") === "on",
                  });
                }}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input className="field" name="nameEn" defaultValue={course.nameEn} />
                    <input className="field" name="nameAr" defaultValue={course.nameAr} />
                    <input className="field" name="durationEn" defaultValue={course.durationEn} />
                    <input className="field" name="durationAr" defaultValue={course.durationAr} />
                    <input className="field" name="price" type="number" min="0" step="0.01" defaultValue={course.price ?? ""} placeholder={t.admin.price} />
                  </div>
                  <textarea className="field min-h-24" name="descriptionEn" defaultValue={course.descriptionEn} />
                  <textarea className="field min-h-24" name="descriptionAr" defaultValue={course.descriptionAr} />
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="contactPricing" defaultChecked={course.contactPricing} />{t.admin.contactPrice}</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={course.active} />{t.admin.active}</label>
                  <button className="w-fit bg-navy px-4 py-2 text-sm font-semibold text-white" type="submit">{t.admin.save}</button>
                </form>
              ))}
            </div>
          ) : null}
          {tab === "testimonials" ? <Testimonials items={data.testimonials} onSave={(body) => mutate(body)} /> : null}
          {tab === "whatsapp" ? (
            <div className="grid gap-3">
              {data.notifications.map((item) => (
                <article key={item.id} className="bg-white p-4 text-sm">
                  <p className="font-semibold">{t.admin.notificationKinds[item.kind as keyof typeof t.admin.notificationKinds] ?? item.kind} · {t.admin.notificationStatuses[item.status as keyof typeof t.admin.notificationStatuses] ?? item.status}</p>
                  <p className="text-black/60"><span dir="ltr">{item.recipient}</span> · {new Date(item.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB")}</p>
                  {item.error ? <p className="mt-1 text-red-700">{item.error}</p> : null}
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-black/70">{item.message}</pre>
                </article>
              ))}
            </div>
          ) : null}
          {tab === "settings" ? <SettingsForm settings={data.settings} onSave={(settings) => mutate({ action: "updateSettings", settings })} onPassword={(current, next) => mutate({ action: "changePassword", current, next })} /> : null}
        </section>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return <div className="bg-white p-5"><p className="text-xs uppercase tracking-[0.12em] text-black/45">{label}</p><p className="mt-2 font-display text-3xl font-bold text-navy">{value}</p></div>;
}

function Testimonials({ items, onSave }: { items: Record<string, unknown>[]; onSave: (body: Record<string, unknown>) => void }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4">
      <form className="grid gap-2 bg-white p-4" onSubmit={(event) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget);
        onSave({ action: "saveTestimonial", nameEn: fd.get("nameEn"), nameAr: fd.get("nameAr"), affiliationEn: fd.get("affiliationEn"), affiliationAr: fd.get("affiliationAr"), reviewEn: fd.get("reviewEn"), reviewAr: fd.get("reviewAr"), rating: fd.get("rating"), initials: fd.get("initials"), isDemo: fd.get("isDemo") === "on", active: true });
        event.currentTarget.reset();
      }}>
        <p className="font-semibold">{t.admin.addTestimonial}</p>
        <div className="grid gap-2 md:grid-cols-2">
          <input className="field" name="nameEn" placeholder={t.admin.nameEn} required />
          <input className="field" name="nameAr" placeholder={t.admin.nameAr} required />
          <input className="field" name="affiliationEn" placeholder={t.admin.affiliationEn} required />
          <input className="field" name="affiliationAr" placeholder={t.admin.affiliationAr} required />
          <input className="field" name="initials" placeholder={t.admin.initials} required />
          <input className="field" name="rating" type="number" min={1} max={5} defaultValue={5} aria-label={t.admin.rating} />
        </div>
        <textarea className="field" name="reviewEn" required placeholder={t.admin.reviewEn} />
        <textarea className="field" name="reviewAr" required placeholder={t.admin.reviewAr} />
        <label className="text-sm"><input type="checkbox" name="isDemo" /> {t.admin.demo}</label>
        <button className="w-fit bg-navy px-4 py-2 text-sm font-semibold text-white" type="submit">{t.admin.save}</button>
      </form>
      {items.map((item) => (
        <form key={String(item.id)} className="grid gap-2 bg-white p-4" onSubmit={(event) => {
          event.preventDefault();
          const fd = new FormData(event.currentTarget);
          onSave({ action: "saveTestimonial", id: item.id, nameEn: fd.get("nameEn"), nameAr: fd.get("nameAr"), affiliationEn: fd.get("affiliationEn"), affiliationAr: fd.get("affiliationAr"), reviewEn: fd.get("reviewEn"), reviewAr: fd.get("reviewAr"), rating: fd.get("rating"), initials: fd.get("initials"), isDemo: fd.get("isDemo") === "on", active: fd.get("active") === "on", sortOrder: item.sortOrder, avatarHue: item.avatarHue });
        }}>
          <div className="grid gap-2 md:grid-cols-2">
            <input className="field" name="nameEn" defaultValue={String(item.nameEn)} aria-label={t.admin.nameEn} />
            <input className="field" name="nameAr" defaultValue={String(item.nameAr)} aria-label={t.admin.nameAr} />
            <input className="field" name="affiliationEn" defaultValue={String(item.affiliationEn)} aria-label={t.admin.affiliationEn} />
            <input className="field" name="affiliationAr" defaultValue={String(item.affiliationAr)} aria-label={t.admin.affiliationAr} />
            <input className="field" name="initials" defaultValue={String(item.initials)} aria-label={t.admin.initials} />
            <input className="field" name="rating" type="number" defaultValue={Number(item.rating)} aria-label={t.admin.rating} />
          </div>
          <textarea className="field" name="reviewEn" defaultValue={String(item.reviewEn)} aria-label={t.admin.reviewEn} />
          <textarea className="field" name="reviewAr" defaultValue={String(item.reviewAr)} aria-label={t.admin.reviewAr} />
          <label className="text-sm"><input type="checkbox" name="isDemo" defaultChecked={Boolean(item.isDemo)} /> {t.admin.demo}</label>
          <label className="text-sm"><input type="checkbox" name="active" defaultChecked={Boolean(item.active)} /> {t.admin.active}</label>
          <div className="flex gap-2">
            <button className="bg-navy px-4 py-2 text-sm font-semibold text-white" type="submit">{t.admin.save}</button>
            <button className="border border-ink px-4 py-2 text-sm" type="button" onClick={() => onSave({ action: "deleteTestimonial", id: item.id })}>{t.admin.delete}</button>
          </div>
        </form>
      ))}
    </div>
  );
}

function SettingsForm({ settings, onSave, onPassword }: { settings: Record<string, string>; onSave: (settings: Record<string, string>) => void; onPassword: (current: string, next: string) => void }) {
  const { t } = useI18n();
  const keys = ["email", "whatsapp_number", "location_en", "location_ar", "tiktok", "instagram", "facebook", "whatsapp", "telegram", "linkedin", "youtube", "x"];
  return (
    <div className="grid gap-4">
      <form className="grid gap-3 bg-white p-4" onSubmit={(event) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget);
        const next: Record<string, string> = {};
        for (const key of keys) next[key] = String(fd.get(key) ?? "");
        onSave(next);
      }}>
        {keys.map((key) => (
          <label key={key} className="text-sm font-semibold">{t.admin.settingLabels[key as keyof typeof t.admin.settingLabels] ?? key}<input className="field mt-1 font-normal" name={key} defaultValue={settings[key] ?? ""} /></label>
        ))}
        <p className="text-xs text-black/55">{t.admin.settingsNote}</p>
        <button className="w-fit bg-navy px-4 py-2 text-sm font-semibold text-white" type="submit">{t.admin.save}</button>
      </form>
      <form className="grid gap-3 bg-white p-4" onSubmit={(event) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget);
        onPassword(String(fd.get("current") ?? ""), String(fd.get("next") ?? ""));
      }}>
        <label className="text-sm font-semibold">{t.admin.currentPassword}<input className="field mt-1" type="password" name="current" required /></label>
        <label className="text-sm font-semibold">{t.admin.newPassword}<input className="field mt-1" type="password" name="next" minLength={8} required /></label>
        <button className="w-fit bg-navy px-4 py-2 text-sm font-semibold text-white" type="submit">{t.admin.save}</button>
      </form>
    </div>
  );
}
