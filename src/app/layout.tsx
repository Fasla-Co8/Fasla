import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo, IBM_Plex_Sans_Arabic, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/LanguageProvider";
import { FloatingLanguageSwitch } from "@/components/FloatingLanguageSwitch";
import type { Lang } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["400", "600", "700", "800"], variable: "--font-cairo", display: "swap" });
const plex = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-plex", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "FASLA | English Learning Platform",
    template: "%s | FASLA",
  },
  description:
    "FASLA is a professional English learning platform. Structured courses from A1 to C1, a free placement test, and practical speaking, grammar, reading, and writing.",
  keywords: ["FASLA", "English courses", "Egypt", "CEFR", "placement test", "learn English"],
  openGraph: {
    title: "FASLA | English Learning Platform",
    description: "Learn smarter. Speak confidently. Build your future with FASLA.",
    locale: "en_EG",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const lang: Lang = jar.get("fasla_lang")?.value === "ar" ? "ar" : "en";
  return (
    <html lang={lang === "ar" ? "ar" : "en"} dir={lang === "ar" ? "rtl" : "ltr"} className={`${inter.variable} ${jakarta.variable} ${cairo.variable} ${plex.variable}`}>
      <body className="antialiased">
        <LanguageProvider initialLang={lang}>
          {children}
          <FloatingLanguageSwitch />
        </LanguageProvider>
      </body>
    </html>
  );
}
