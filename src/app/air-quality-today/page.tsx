import { Metadata } from "next";
import Link from "next/link";
import { getTopPollutedCities, getCleanestCities, getAllCitiesWithLatest } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { AdSlot } from "@/components/AdSlot";
import { CitySearch } from "@/components/CitySearch";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

export const metadata: Metadata = {
  title: "Air Quality Today (Real-Time AQI & PM2.5 Worldwide)",
  description:
    "Check real-time air quality today for major cities worldwide. Live AQI and PM2.5 data updated hourly with health recommendations.",
  keywords: [
    "air quality today",
    "air quality index today",
    "AQI today",
    "air pollution today",
    "is air quality safe today",
    "worldwide air quality",
    "live AQI",
  ],
  openGraph: {
    title: "Air Quality Today (Real-Time AQI & PM2.5 Worldwide) | DUST.FAZR",
    description: "Check real-time air quality today for major cities worldwide. Live AQI and PM2.5 data updated hourly with health recommendations.",
    url: `${baseUrl}/air-quality-today`,
    siteName: "DUST.FAZR",
    type: "website",
  },
  alternates: { canonical: `${baseUrl}/air-quality-today` },
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

export default async function AirQualityTodayPage() {
  let polluted: Awaited<ReturnType<typeof getTopPollutedCities>> = [];
  let cleanest: Awaited<ReturnType<typeof getCleanestCities>> = [];
  let allCities: Awaited<ReturnType<typeof getAllCitiesWithLatest>> = [];

  try {
    [polluted, cleanest, allCities] = await Promise.all([
      getTopPollutedCities(10),
      getCleanestCities(10),
      getAllCitiesWithLatest(),
    ]);
  } catch {}

  const latestUpdate = polluted.length > 0 ? polluted[0].updated_at : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Air Quality Today", item: `${baseUrl}/air-quality-today` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
          <a href="/" className="hover:text-neutral-300 transition-colors">Home</a>
          <span className="mx-2 text-neutral-800">/</span>
          <span className="text-neutral-400">Air Quality Today</span>
        </nav>

        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Air Quality Today
          </h1>
          <p className="text-lg text-zinc-500 font-medium">
            Live AQI Worldwide
          </p>
          <p className="text-xs text-zinc-600">
            Real-time air pollution data for cities around the world
          </p>
          {latestUpdate && (
            <p className="text-xs text-zinc-600">
              Updated {formatTimeAgo(latestUpdate)} · Data from WAQI
            </p>
          )}
        </section>

        {/* CTA: City Search */}
        <CitySearch cities={allCities.map((c) => ({ name: c.name, slug: c.slug, country: c.country }))} />

        <AdSlot slot="4286289660" />

        {/* Most Polluted Today */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Most Polluted Cities Today</h2>
            <Link href="/top-most-polluted-cities" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              View all →
            </Link>
          </div>
          {polluted.length === 0 ? (
            <p className="text-sm text-zinc-600">Data is being updated.</p>
          ) : (
            <div className="space-y-2">
              {polluted.slice(0, 5).map((city, i) => {
                const info = getAqiInfo(city.aqi);
                return (
                  <Link
                    key={city.id}
                    href={`/air-quality/${city.slug}`}
                    className="group flex items-center gap-3 p-4 rounded-2xl border border-[#1e1e1e] bg-[#121212] hover:border-zinc-600 hover:bg-[#1a1a1a] transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <span className="text-lg font-black text-zinc-700 w-7 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{city.name}</p>
                      <p className="text-[11px] text-zinc-600">{city.country}</p>
                    </div>
                    <div className="text-right shrink-0 max-w-[100px] sm:max-w-none">
                      <p className="text-2xl font-black tracking-tight" style={{ color: info.color }}>{city.aqi}</p>
                      <p className="text-[10px] font-semibold leading-tight" style={{ color: info.color }}>{info.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <AdSlot slot="1237454490" />

        {/* Cleanest Cities Today */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Cleanest Cities Today</h2>
            <Link href="/best-air-quality-cities" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              View all →
            </Link>
          </div>
          {cleanest.length === 0 ? (
            <p className="text-sm text-zinc-600">Data is being updated.</p>
          ) : (
            <div className="space-y-2">
              {cleanest.slice(0, 5).map((city, i) => {
                const info = getAqiInfo(city.aqi);
                return (
                  <Link
                    key={city.id}
                    href={`/air-quality/${city.slug}`}
                    className="group flex items-center gap-3 p-4 rounded-2xl border border-[#1e1e1e] bg-[#121212] hover:border-zinc-600 hover:bg-[#1a1a1a] transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <span className="text-lg font-black text-zinc-700 w-7 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{city.name}</p>
                      <p className="text-[11px] text-zinc-600">{city.country}</p>
                    </div>
                    <div className="text-right shrink-0 max-w-[100px] sm:max-w-none">
                      <p className="text-2xl font-black tracking-tight" style={{ color: info.color }}>{city.aqi}</p>
                      <p className="text-[10px] font-semibold leading-tight" style={{ color: info.color }}>{info.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Explore More */}
        <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4">Explore More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/top-most-polluted-cities" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Most Polluted Cities →</p>
            </Link>
            <Link href="/best-air-quality-cities" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Cleanest Cities →</p>
            </Link>
            <Link href="/air-quality-by-country" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Air Quality by Country →</p>
            </Link>
            <Link href="/aqi-scale-explained" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">AQI Scale Explained →</p>
            </Link>
          </div>
        </section>

        <AdSlot slot="4617195255" />

        {/* SEO Content */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Understanding Air Quality Today</h2>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 leading-relaxed">
              Air quality changes throughout the day based on weather patterns, traffic, industrial activity, and seasonal factors.
              The Air Quality Index (AQI) is the standard measurement used worldwide to communicate how polluted the air is.
              An AQI below 50 is considered good, while anything above 100 may be unhealthy for sensitive groups.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              PM2.5 (fine particulate matter) is the most harmful air pollutant, penetrating deep into the lungs and bloodstream.
              The WHO recommends annual PM2.5 levels below 15 µg/m³. Check your city above to see current PM2.5 levels and health recommendations.
            </p>
          </div>
        </section>

        <footer className="text-xs text-neutral-700 leading-relaxed border-t border-[#1e1e1e] pt-6">
          <p>
            Air quality data is sourced from government monitoring stations worldwide via WAQI.
            AQI values follow EPA standards based on PM2.5 concentrations. Updated hourly.
          </p>
        </footer>
      </main>
    </>
  );
}
