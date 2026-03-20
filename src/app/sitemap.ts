import { MetadataRoute } from "next";
import { getAllCitySlugs } from "@/lib/db";
import { COMPARE_PAIRS } from "@/lib/compare";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  let slugs: string[] = [];
  try {
    slugs = await getAllCitySlugs();
  } catch {
    // DB not available
  }

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

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...cityPages,
    ...comparePages,
  ];
}
