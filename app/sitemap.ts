import type { MetadataRoute } from "next";
import { locales } from "@/i18n";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://portfolio.ned-it.de";

const pages = [
  "about",
  "projects",
  "personal",
  "career",
  "skills",
  "languages",
  "contact",
  "impressum",
  "datenschutz",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${siteUrl}/${locale}/${page}`,
        lastModified: new Date(),
        changeFrequency: page === "about" ? "weekly" : "monthly",
        priority: page === "about" ? 1.0 : page === "contact" ? 0.8 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${siteUrl}/${l}/${page}`]),
          ),
        },
      });
    }
  }

  return entries;
}
