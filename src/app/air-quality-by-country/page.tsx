import { Metadata } from "next";
import Link from "next/link";
import { getCountryStats } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

export const metadata: Metadata = {
  title: "Air Quality by Country (Live AQI Rankings)",
  description:
    "Compare air quality across countries worldwide. See average AQI rankings by country with real-time PM2.5 data. Updated hourly.",
  keywords: [
    "air quality by country",
    "country air pollution ranking",
    "AQI by country",
    "world air quality comparison",
    "pollution by country",
  ],
  openGraph: {
    title: "Air Quality by Country — Live AQI Rankings | DUST.FAZR",
    description: "Compare air pollution levels across countries with real-time data.",
    url: `${baseUrl}/air-quality-by-country`,
    siteName: "DUST.FAZR",
    type: "website",
  },
  alternates: { canonical: `${baseUrl}/air-quality-by-country` },
};

export default async function AirQualityByCountryPage() {
  let countries: Awaited<ReturnType<typeof getCountryStats>> = [];
  try {
    countries = await getCountryStats();
  } catch {}

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Air Quality by Country",
    numberOfItems: countries.length,
    itemListElement: countries.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${c.country} — Avg AQI ${c.avg_aqi}`,
      url: `${baseUrl}/air-quality-by-country/${c.country_slug}`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Air Quality by Country", item: `${baseUrl}/air-quality-by-country` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
          <a href="/" className="hover:text-neutral-300 transition-colors">Home</a>
          <span className="mx-2 text-neutral-800">/</span>
          <span className="text-neutral-400">Air Quality by Country</span>
        </nav>

        <section className="text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Air Quality by Country
          </h1>
          <p className="text-base text-zinc-500 font-medium">Average AQI Rankings</p>
          <p className="text-xs text-zinc-600">
            Ranked by average AQI across monitored cities · Data from WAQI
          </p>
        </section>

        <AdSlot slot="4286289660" />

        {countries.length === 0 ? (
          <p className="text-center text-zinc-700 py-12">Country data is being updated.</p>
        ) : (
          <section className="space-y-3">
            {countries.map((c, i) => {
              const info = getAqiInfo(c.avg_aqi);
              return (
                <Link
                  key={c.country_slug}
                  href={`/air-quality-by-country/${c.country_slug}`}
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-[#1e1e1e] bg-[#121212] hover:border-zinc-600 hover:bg-[#1a1a1a] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <span className="text-2xl font-black text-zinc-700 w-8 text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-white group-hover:text-zinc-100 transition-colors truncate">
                      {c.country}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {c.city_count} {c.city_count === 1 ? "city" : "cities"} monitored
                    </p>
                  </div>
                  <div className="text-right shrink-0 max-w-[120px] sm:max-w-none">
                    <p className="text-3xl font-black tracking-tight" style={{ color: info.color }}>
                      {c.avg_aqi}
                    </p>
                    <p className="text-[11px] font-semibold mt-1 leading-tight" style={{ color: info.color }}>
                      Avg AQI · {info.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        <AdSlot slot="1237454490" />

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Understanding Country Air Quality</h2>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 leading-relaxed">
              Country-level air quality is calculated as the average AQI across all monitored cities in each country.
              This provides a broad overview of air pollution patterns, though individual cities within a country
              can vary significantly based on local conditions.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Factors affecting country-wide air quality include industrial activity, vehicle emissions,
              geographic features, seasonal weather patterns, and environmental regulations. Click on any
              country to see detailed city-by-city air quality data.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4">Explore More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/top-most-polluted-cities" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Most Polluted Cities →</p>
            </Link>
            <Link href="/best-air-quality-cities" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Cleanest Cities →</p>
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

        <footer className="text-xs text-neutral-700 leading-relaxed border-t border-[#1e1e1e] pt-6">
          <p>
            Country averages are calculated from real-time data collected from government monitoring
            stations via WAQI. Individual city AQI values follow EPA standards. Updated hourly.
          </p>
        </footer>
      </main>
    </>
  );
}
