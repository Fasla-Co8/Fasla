"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, type Dictionary, type Lang } from "@/lib/i18n";

type ContextValue = {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: Dictionary;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<ContextValue | null>(null);
const STORAGE_KEY = "fasla_lang";

function isLang(value: unknown): value is Lang {
  return value === "en" || value === "ar";
}

function readCookieLang(): Lang | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${STORAGE_KEY}=`));
  const value = row?.slice(STORAGE_KEY.length + 1);
  return isLang(value) ? value : null;
}

function readStoredLang(): Lang | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // Private mode or storage restrictions: fall back to the cookie.
  }
  return readCookieLang();
}

function applyDocumentLang(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

function persistLang(lang: Lang) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // The cookie below still keeps the preference for normal browsing.
  }
  const secure = window.location.protocol === "https:";
  document.cookie = `${STORAGE_KEY}=${lang};path=/;max-age=31536000;samesite=${secure ? "none" : "lax"}${secure ? "; secure" : ""}`;
}

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // Restore the visitor's saved choice after hydration. This also protects against
  // server refreshes/navigation responses that still carry the default language.
  useEffect(() => {
    const stored = readStoredLang();
    if (stored) {
      setLangState(stored);
      persistLang(stored);
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && isLang(event.newValue)) {
        setLangState(event.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    applyDocumentLang(lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    persistLang(next);
    applyDocumentLang(next);
    setLangState(next);
  }, []);

  const value = useMemo<ContextValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      t: dictionaries[lang],
      setLang,
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("LanguageProvider is missing");
  return value;
}
