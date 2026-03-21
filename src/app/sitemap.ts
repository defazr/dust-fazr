import { MetadataRoute } from "next";
import { getAllCitySlugs, getAllCountrySlugs } from "@/lib/db";
import { COMPARE_PAIRS } from "@/lib/compare";
import { KEYWORD_CITIES } from "@/lib/keyword-cities";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  let slugs: string[] = [];
  let countrySlugs: string[] = [];
  try {
    slugs = await getAllCitySlugs();
    countrySlugs = await getAllCountrySlugs();
  } catch {}

  const cityPages = slugs.map((slug) => ({
    url: `${baseUrl}/air-quality/${slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  const comparePages = COMPARE_PAIRS.map((pair) => ({
    url: `${baseUrl}/compare/${pair.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.7,
  }));

  const countryPages = countrySlugs.map((slug) => ({
    url: `${baseUrl}/air-quality-by-country/${slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.7,
  }));

  // Keyword-driven pages (action/problem types)
  const keywordPages = KEYWORD_CITIES.flatMap((c) => [
    { url: `${baseUrl}/is-it-safe-to-go-outside/${c.city}`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.75 },
    { url: `${baseUrl}/should-i-wear-mask/${c.city}`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.75 },
    { url: `${baseUrl}/why-is-air-quality-bad/${c.city}`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.75 },
  ]);

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/air-quality-today`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.95 },
    { url: `${baseUrl}/aqi-scale-explained`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/top-most-polluted-cities`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/best-air-quality-cities`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/air-quality-by-country`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    ...keywordPages,
    ...cityPages,
    ...comparePages,
    ...countryPages,
  ];
}
