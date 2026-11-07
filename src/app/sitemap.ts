import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paths = ["", "/courses", "/register", "/placement", "/privacy", "/terms", "/refund", "/courses/a1-beginner", "/courses/a2-elementary", "/courses/b1-intermediate", "/courses/b2-upper-intermediate", "/courses/c1-advanced", "/courses/grammar-mastery", "/courses/speaking-mastery"];
  return paths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 }));
}
