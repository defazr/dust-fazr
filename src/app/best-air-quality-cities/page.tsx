import { Metadata } from "next";
import Link from "next/link";
import { getCleanestCities } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

export const metadata: Metadata = {
  title: "Cleanest Cities Right Now (Best Air Quality) – Where Is the Air Safest?",
  description:
    "Top 10 cities with the cleanest air right now. Find out where the air is safest to breathe today. Live AQI ranking updated hourly.",
  keywords: [
    "best air quality cities",
    "cleanest cities",
    "lowest AQI",
    "best air quality today",
    "clean air cities ranking",
  ],
  openGraph: {
    title: "Cleanest Cities Today — Best Air Quality Ranking | DUST.FAZR",
    description: "Real-time ranking of cities with the cleanest air worldwide.",
    url: `${baseUrl}/best-air-quality-cities`,
    siteName: "DUST.FAZR",
    type: "website",
  },
  alternates: { canonical: `${baseUrl}/best-air-quality-cities` },
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

export default async function BestAirQualityCitiesPage() {
  let cities: Awaited<ReturnType<typeof getCleanestCities>> = [];
  try {
    cities = await getCleanestCities(10);
  } catch {}

  const latestUpdate = cities.length > 0 ? cities[0].updated_at : null;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cleanest Cities Today",
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
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Best Air Quality Cities", item: `${baseUrl}/best-air-quality-cities` },
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
          <span className="text-neutral-400">Best Air Quality Cities</span>
        </nav>

        <section className="text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Cleanest Cities Today
          </h1>
          <p className="text-base text-zinc-500 font-medium">Best Air Quality Ranking</p>
          <p className="text-xs text-zinc-600">Cities with the lowest AQI based on real-time PM2.5 data</p>
          {latestUpdate && (
            <p className="text-xs text-zinc-600">Updated {formatTimeAgo(latestUpdate)} · Data from OpenAQ</p>
          )}
        </section>

        <AdSlot slot="4286289660" />

        {cities.length === 0 ? (
          <p className="text-center text-zinc-700 py-12">Ranking data is being updated.</p>
        ) : (
          <section className="space-y-3">
            {cities.map((city, i) => {
              const info = getAqiInfo(city.aqi);
              return (
                <Link
                  key={city.id}
                  href={`/air-quality/${city.slug}`}
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-[#1e1e1e] bg-[#121212] hover:border-zinc-600 hover:bg-[#1a1a1a] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <span className="text-2xl md:text-3xl font-black text-zinc-700 w-10 text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-white group-hover:text-zinc-100 transition-colors truncate">
                      {city.name}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">{city.country}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: info.color }}>
                      {city.aqi}
                    </p>
                    <p className="text-[11px] font-semibold mt-1" style={{ color: info.color }}>
                      {info.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        <AdSlot slot="1237454490" />

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">About Clean Air Cities</h2>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 leading-relaxed">
              {cities.length > 0
                ? `${cities[0].name} currently has the best air quality among tracked cities with an AQI of ${cities[0].aqi}. ` +
                  `Low AQI values indicate minimal air pollution, meaning outdoor activities can be enjoyed safely without health concerns.`
                : "Clean air data is being updated."}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The World Health Organization recommends annual average PM2.5 levels below 15 µg/m³.
              Cities in this ranking typically benefit from favorable weather, low industrial emissions,
              geographic advantages, or effective environmental policies.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Air quality is dynamic and can change rapidly. This ranking updates hourly based on
              real-time monitoring data from OpenAQ. Click on any city for detailed pollution data
              including PM2.5, PM10, and 24-hour trend charts.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4">Explore More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/top-most-polluted-cities" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Most Polluted Cities →</p>
            </Link>
            <Link href="/air-quality-by-country" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Air Quality by Country →</p>
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
            Rankings are based on real-time AQI data from government monitoring stations via OpenAQ.
            AQI values follow EPA standards calculated from PM2.5 concentrations. Updated hourly.
          </p>
        </footer>
      </main>
    </>
  );
}
