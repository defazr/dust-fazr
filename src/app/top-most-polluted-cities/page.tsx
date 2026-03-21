import { Metadata } from "next";
import Link from "next/link";
import { getTopPollutedCities } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { makeCompareSlug } from "@/lib/compare";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Most Polluted Cities Right Now (Live AQI Ranking) – Should You Stay Indoors?",
  description:
    "Top 10 most polluted cities in the world right now. Live AQI ranking with PM2.5 data. Find out if your city is on the list. Updated hourly.",
  keywords: [
    "most polluted cities",
    "worst air quality",
    "top polluted cities today",
    "AQI ranking",
    "air pollution ranking",
    "PM2.5 ranking",
    "world air quality",
  ],
  openGraph: {
    title: "Most Polluted Cities Today — Live AQI Ranking | DUST.FAZR",
    description:
      "Real-time ranking of the most polluted cities worldwide based on AQI and PM2.5 data.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr"}/top-most-polluted-cities`,
    siteName: "DUST.FAZR",
    type: "website",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr"}/top-most-polluted-cities`,
  },
};

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getAnalysisText(
  cities: { name: string; aqi: number; pm25: number | null }[]
) {
  if (cities.length === 0) return [];

  const worst = cities[0];
  const best = cities[cities.length - 1];
  const unhealthyCount = cities.filter((c) => c.aqi > 100).length;

  const paragraphs: string[] = [];

  paragraphs.push(
    `${worst.name} currently has the worst air quality among tracked cities with an AQI of ${worst.aqi}. ` +
      `${
        worst.pm25 != null
          ? `PM2.5 levels are at ${worst.pm25} µg/m³, which is ${
              worst.pm25 > 45
                ? "well above the WHO 24-hour guideline of 45 µg/m³"
                : worst.pm25 > 15
                  ? "above the WHO annual guideline of 15 µg/m³"
                  : "within WHO guidelines"
            }. `
          : ""
      }` +
      `High AQI values can result from seasonal weather patterns, industrial emissions, traffic congestion, and geographic factors that trap pollutants.`
  );

  if (unhealthyCount > 0) {
    paragraphs.push(
      `Currently, ${unhealthyCount} of the top 10 cities have AQI levels above 100 (Unhealthy for Sensitive Groups or worse). ` +
        `People with respiratory conditions, children, and the elderly in these cities should limit prolonged outdoor exposure. ` +
        `Consider wearing N95 masks outdoors and using air purifiers indoors when AQI exceeds 150.`
    );
  } else {
    paragraphs.push(
      `All top 10 cities currently have AQI levels below 100, indicating generally acceptable air quality. ` +
        `However, unusually sensitive individuals may still experience minor symptoms. ` +
        `Monitor conditions regularly as air quality can change rapidly.`
    );
  }

  paragraphs.push(
    `This ranking updates hourly based on real-time data from government monitoring stations worldwide via OpenAQ. ` +
      `${best.name} ranks lowest among the top 10 with an AQI of ${best.aqi}. ` +
      `For detailed city-level data including PM2.5, PM10, and trend charts, click on any city above.`
  );

  return paragraphs;
}

export default async function MostPollutedCitiesPage() {
  let cities: Awaited<ReturnType<typeof getTopPollutedCities>> = [];
  try {
    cities = await getTopPollutedCities(10);
  } catch {
    // DB not available
  }

  const latestUpdate =
    cities.length > 0 ? cities[0].updated_at : null;
  const analysis = getAnalysisText(cities);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Most Polluted Cities Today",
    description:
      "Live ranking of the most polluted cities worldwide based on AQI",
    url: `${baseUrl}/top-most-polluted-cities`,
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Most Polluted Cities Today",
    numberOfItems: cities.length,
    itemListElement: cities.map((city, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${city.name} — AQI ${city.aqi}`,
      url: `${baseUrl}/air-quality/${city.slug}`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Most Polluted Cities",
        item: `${baseUrl}/top-most-polluted-cities`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
          <a
            href="/"
            className="hover:text-neutral-300 transition-colors"
          >
            Home
          </a>
          <span className="mx-2 text-neutral-800">/</span>
          <span className="text-neutral-400">Most Polluted Cities</span>
        </nav>

        {/* Hero */}
        <section className="text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Most Polluted Cities Today
          </h1>
          <p className="text-base text-zinc-500 font-medium">
            Live AQI Ranking
          </p>
          <p className="text-xs text-zinc-600">
            Real-time air pollution data based on PM2.5 (OpenAQ)
          </p>
          {latestUpdate && (
            <p className="text-xs text-zinc-600">
              Updated {formatTimeAgo(latestUpdate)} · Data from OpenAQ
            </p>
          )}
        </section>

        <AdSlot slot="4286289660" />

        {/* TOP 10 List */}
        {cities.length === 0 ? (
          <p className="text-center text-zinc-700 py-12">
            Ranking data is being updated. Check back soon.
          </p>
        ) : (
          <section className="space-y-3">
            {cities.map((city, i) => {
              const info = getAqiInfo(city.aqi);
              const rank = i + 1;
              return (
                <div key={city.id} className="space-y-1">
                  <Link
                    href={`/air-quality/${city.slug}`}
                    className="group flex items-center gap-4 p-5 rounded-2xl border border-[#1e1e1e] bg-[#121212] hover:border-zinc-600 hover:bg-[#1a1a1a] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    {/* Rank */}
                    <span className="text-2xl md:text-3xl font-black text-zinc-700 w-10 text-right shrink-0">
                      {rank}
                    </span>

                    {/* City info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base text-white group-hover:text-zinc-100 transition-colors truncate">
                        {city.name}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {city.country}
                      </p>
                    </div>

                    {/* AQI + Status */}
                    <div className="text-right shrink-0">
                      <p
                        className="text-3xl md:text-4xl font-black tracking-tight"
                        style={{ color: info.color }}
                      >
                        {city.aqi}
                      </p>
                      <p
                        className="text-[11px] font-semibold mt-1"
                        style={{ color: info.color }}
                      >
                        {info.label}
                      </p>
                    </div>
                  </Link>

                  {/* Compare link */}
                  {i < cities.length - 1 && (
                    <div className="pl-14 flex gap-3">
                      <Link
                        href={`/compare/${makeCompareSlug(city.slug, cities[i + 1].slug)}`}
                        className="text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        Compare {city.name} vs {cities[i + 1].name} →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        <AdSlot slot="1237454490" />

        {/* Analysis */}
        {analysis.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              Air Pollution Analysis
            </h2>
            <div className="space-y-4">
              {analysis.map((p, i) => (
                <p
                  key={i}
                  className="text-sm text-zinc-400 leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Internal links */}
        <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4">
            Explore More
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/compare/seoul-vs-tokyo-air-quality"
              className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer"
            >
              <p className="text-sm font-semibold text-zinc-300">
                Seoul vs Tokyo →
              </p>
            </Link>
            <Link
              href="/compare/seoul-vs-beijing-air-quality"
              className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer"
            >
              <p className="text-sm font-semibold text-zinc-300">
                Seoul vs Beijing →
              </p>
            </Link>
            <Link
              href="/compare/tokyo-vs-beijing-air-quality"
              className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer"
            >
              <p className="text-sm font-semibold text-zinc-300">
                Tokyo vs Beijing →
              </p>
            </Link>
            <Link
              href="/"
              className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer"
            >
              <p className="text-sm font-semibold text-zinc-300">
                Browse All Cities →
              </p>
            </Link>
          </div>
        </section>

        <section className="text-center py-2">
          <Link
            href="/air-quality-today"
            className="inline-block px-8 py-4 rounded-2xl bg-[#121212] border border-[#1e1e1e] hover:border-zinc-600 hover:bg-[#1a1a1a] transition-all duration-200 cursor-pointer"
          >
            <p className="text-sm font-bold text-white">Check air quality in your city →</p>
          </Link>
        </section>

        <AdSlot slot="4617195255" />

        {/* SEO Footer */}
        <footer className="text-xs text-neutral-700 leading-relaxed border-t border-[#1e1e1e] pt-6">
          <p>
            This ranking is generated from real-time air quality data
            collected from government monitoring stations worldwide via
            OpenAQ. AQI values are calculated using EPA standards based
            on PM2.5 concentrations. Rankings update hourly to reflect
            the latest conditions.
          </p>
        </footer>
      </main>
    </>
  );
}
