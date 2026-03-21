import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getCitiesByCountry, getAllCountrySlugs } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { makeCompareSlug } from "@/lib/compare";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllCountrySlugs();
    return slugs.map((country) => ({ country }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  const cities = await getCitiesByCountry(country);
  if (cities.length === 0) return { title: "Country Not Found" };

  const countryName = cities[0].country;
  const withAqi = cities.filter((c) => c.aqi != null);
  const avgAqi = withAqi.length > 0
    ? Math.round(withAqi.reduce((sum, c) => sum + (c.aqi ?? 0), 0) / withAqi.length)
    : null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  return {
    title: `${countryName} Air Quality (${avgAqi ? `Avg AQI ${avgAqi}` : "Live Data"}) — ${cities.length} Cities | DUST.FAZR`,
    description: `Air quality in ${countryName}: ${cities.length} cities monitored. ${avgAqi ? `Average AQI ${avgAqi}.` : ""} See city-by-city pollution data with PM2.5 levels. Updated hourly.`,
    keywords: [
      `${countryName} air quality`,
      `${countryName} AQI`,
      `${countryName} pollution`,
      `${countryName} PM2.5`,
      `air quality ${countryName}`,
    ],
    openGraph: {
      title: `${countryName} Air Quality — ${cities.length} Cities | DUST.FAZR`,
      description: `Real-time air quality data for ${cities.length} cities in ${countryName}.`,
      url: `${baseUrl}/air-quality-by-country/${country}`,
      siteName: "DUST.FAZR",
      type: "website",
    },
    alternates: { canonical: `${baseUrl}/air-quality-by-country/${country}` },
  };
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function CountryPage({ params }: PageProps) {
  const { country } = await params;
  const cities = await getCitiesByCountry(country);

  if (cities.length === 0) notFound();

  const countryName = cities[0].country;
  const withAqi = cities.filter((c) => c.aqi != null);
  const avgAqi = withAqi.length > 0
    ? Math.round(withAqi.reduce((sum, c) => sum + (c.aqi ?? 0), 0) / withAqi.length)
    : null;
  const latestUpdate = withAqi.length > 0 ? withAqi[0].updated_at : null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Countries", item: `${baseUrl}/air-quality-by-country` },
      { "@type": "ListItem", position: 3, name: countryName, item: `${baseUrl}/air-quality-by-country/${country}` },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Air Quality in ${countryName}`,
    numberOfItems: cities.length,
    itemListElement: cities.map((city, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${city.name} — AQI ${city.aqi ?? "N/A"}`,
      url: `${baseUrl}/air-quality/${city.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
          <a href="/" className="hover:text-neutral-300 transition-colors">Home</a>
          <span className="mx-2 text-neutral-800">/</span>
          <a href="/air-quality-by-country" className="hover:text-neutral-300 transition-colors">Countries</a>
          <span className="mx-2 text-neutral-800">/</span>
          <span className="text-neutral-400">{countryName}</span>
        </nav>

        <section className="text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {countryName} Air Quality
          </h1>
          <p className="text-base text-zinc-500 font-medium">
            {cities.length} {cities.length === 1 ? "City" : "Cities"} Monitored
            {avgAqi != null && ` · Average AQI ${avgAqi}`}
          </p>
          {latestUpdate && (
            <p className="text-xs text-zinc-600">Updated {formatTimeAgo(latestUpdate)} · Data from OpenAQ</p>
          )}
        </section>

        <AdSlot slot="4286289660" />

        {/* City list */}
        <section className="space-y-3">
          {cities.map((city, i) => {
            const info = getAqiInfo(city.aqi);
            return (
              <div key={city.id} className="space-y-1">
                <Link
                  href={`/air-quality/${city.slug}`}
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-[#1e1e1e] bg-[#121212] hover:border-zinc-600 hover:bg-[#1a1a1a] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <span className="text-xl font-black text-zinc-700 w-8 text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-white group-hover:text-zinc-100 transition-colors truncate">
                      {city.name}
                    </p>
                    {city.pm25 != null && (
                      <p className="text-xs text-zinc-600 mt-0.5">PM2.5: {city.pm25} µg/m³</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-black tracking-tight" style={{ color: info.color }}>
                      {city.aqi ?? "—"}
                    </p>
                    <p className="text-[11px] font-semibold mt-1" style={{ color: info.color }}>
                      {info.label}
                    </p>
                  </div>
                </Link>

                {/* Compare link with next city */}
                {i < cities.length - 1 && city.aqi != null && cities[i + 1].aqi != null && (
                  <div className="pl-12">
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

        <AdSlot slot="1237454490" />

        {/* Analysis */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Air Quality in {countryName}
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 leading-relaxed">
              {withAqi.length > 0
                ? `${countryName} has ${cities.length} cities currently being monitored for air quality. ` +
                  `The most polluted city is ${withAqi[0].name} with an AQI of ${withAqi[0].aqi}` +
                  (withAqi.length > 1 ? `, while ${withAqi[withAqi.length - 1].name} has the cleanest air at AQI ${withAqi[withAqi.length - 1].aqi}.` : ".")
                : `Air quality data for ${countryName} is being collected and will be available shortly.`}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Air quality varies across {countryName} due to differences in urbanization, industrial activity,
              traffic density, and geographic features. Coastal and rural cities typically have better air quality
              than inland industrial centers.
            </p>
          </div>
        </section>

        {/* Navigation */}
        <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4">Explore More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/air-quality-by-country" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">All Countries →</p>
            </Link>
            <Link href="/top-most-polluted-cities" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Most Polluted Cities →</p>
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
            {countryName} air quality data is sourced from government monitoring stations via OpenAQ.
            AQI values follow EPA standards based on PM2.5 concentrations. Updated hourly.
          </p>
        </footer>
      </main>
    </>
  );
}
