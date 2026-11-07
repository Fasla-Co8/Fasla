import type { CourseDTO } from "@/lib/types";

export const COURSE_DISCOUNT_PERCENT = 50;

export function formatPriceAmount(amount: number, lang: "en" | "ar") {
  return lang === "ar" ? `${amount} جنيه` : `EGP ${amount}`;
}

export function priceLabel(course: Pick<CourseDTO, "price" | "contactPricing">, lang: "en" | "ar") {
  if (course.contactPricing || course.price == null) return lang === "ar" ? "تواصل لمعرفة السعر" : "Contact for pricing";
  return formatPriceAmount(course.price, lang);
}

export function originalPriceLabel(course: Pick<CourseDTO, "price" | "contactPricing">, lang: "en" | "ar") {
  if (course.contactPricing || course.price == null) return null;
  const original = Math.round(course.price * 100 / (100 - COURSE_DISCOUNT_PERCENT));
  return formatPriceAmount(original, lang);
}

export function localized(lang: "en" | "ar", en: string, ar: string) {
  return lang === "ar" ? ar : en;
}
