import { MetadataRoute } from "next";
import { getAllCitySlugs } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.com";

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

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...cityPages,
  ];
}
