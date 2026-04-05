import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getCityBySlug, getAllCitySlugs, getAllCitiesBasic } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { CityHero } from "@/components/CityHero";
import { PollutantCards } from "@/components/PollutantCards";
import { AdSlot } from "@/components/AdSlot";
import { AQIChart } from "@/components/AQIChart";
import { TextAnalysis } from "@/components/TextAnalysis";
import { HistorySection } from "@/components/HistorySection";
import { NearbyCities } from "@/components/NearbyCities";
import { PopularCities } from "@/components/PopularCities";
import { CityFAQ } from "@/components/FAQ";
import { TrackClick } from "@/components/TrackClick";
import { COMPARE_PAIRS } from "@/lib/compare";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCityBySlug(slug);
  if (!data) return { title: "City Not Found" };

  const aq = data.airQuality;
  const aqiText = aq?.aqi !== null && aq?.aqi !== undefined ? `AQI ${aq.aqi}` : "Live AQI";
  const pm25Text = aq?.pm25 !== null && aq?.pm25 !== undefined ? ` PM2.5: ${aq.pm25} µg/m³.` : "";
  const level = aq?.aqi ? getAqiInfo(aq.aqi).label : "Real-time";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  return {
    title: `${data.name} Air Quality Today (${aqiText}) – Is It Safe Right Now? PM2.5 Guide`,
    description: `Live AQI in ${data.name} is ${aqiText} (${level}).${pm25Text} Check PM2.5 levels, health effects, and whether it's safe to go outside today. Updated hourly.`,
    keywords: [
      `${data.name} air quality`,
      `${data.name} AQI`,
      `${data.name} PM2.5`,
      `${data.name} pollution`,
      `${data.name} air quality today`,
      `is ${data.name} air safe`,
      `air quality ${data.country}`,
      "PM2.5 levels",
    ],
    openGraph: {
      title: `${data.name} Air Quality (${aqiText}) – Safe to Go Outside? | DUST.FAZR`,
      description: `Live AQI in ${data.name}: ${level}.${pm25Text} Real-time PM2.5 data and health guide.`,
      url: `${baseUrl}/air-quality/${slug}`,
      siteName: "DUST.FAZR",
      type: "website",
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: `${data.name} Air Quality` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.name} Air Quality (${aqiText}) – Safe Right Now?`,
      description: `${data.name} air quality is ${level.toLowerCase()} today.${pm25Text} Check health guide.`,
      images: ["/og-default.jpg"],
    },
    alternates: {
      canonical: `${baseUrl}/air-quality/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllCitySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function CityAirQualityPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCityBySlug(slug);

  if (!data) {
    notFound();
  }

  const aq = data.airQuality;
  const info = getAqiInfo(aq?.aqi ?? null);

  // Build nearby cities: 6 local + 2 global SEO priority
  const SEO_PRIORITY_SLUGS = [
    "seoul-air-quality",
    "tokyo-air-quality",
    "beijing-air-quality",
    "new-york-air-quality",
    "sydney-air-quality",
    "london-air-quality",
    "bangkok-air-quality",
    "shanghai-air-quality",
    "singapore-air-quality",
    "cairo-air-quality",
  ];

  const nearby = data.nearbyCities.slice(0, 6);
  const nearbySlugs = new Set(nearby.map((c) => c.slug));
  const seoSlugs = SEO_PRIORITY_SLUGS.filter(
    (s) => s !== data.slug && !nearbySlugs.has(s)
  ).slice(0, 2);

  let enrichedNearbyCities = nearby;
  if (seoSlugs.length > 0) {
    const allCities = await getAllCitiesBasic();
    const seoCities = seoSlugs
      .map((s) => allCities.find((c) => c.slug === s))
      .filter((c): c is NonNullable<typeof c> => c != null);
    enrichedNearbyCities = Array.from(
      new Map(
        [...nearby, ...seoCities].map((c) => [c.slug, c])
      ).values()
    ).slice(0, 8);
  }

  // Schema.org structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${data.name} Air Quality Index`,
    description: `Real-time air quality data for ${data.name}, ${data.country}`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.com"}/air-quality/${slug}`,
    mainEntity: {
      "@type": "Place",
      name: data.name,
      address: {
        "@type": "PostalAddress",
        addressCountry: data.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: data.latitude,
        longitude: data.longitude,
      },
    },
    dateModified: aq?.updated_at || new Date().toISOString(),
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.com" },
      { "@type": "ListItem", position: 2, name: `${data.name} Air Quality`, item: `${process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.com"}/air-quality/${slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={schemaData} />
      <JsonLd data={breadcrumbSchema} />
      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
          <a href="/" className="hover:text-neutral-300 transition-colors">Home</a>
          <span className="mx-2 text-neutral-800">/</span>
          <span className="text-neutral-400">{data.name} Air Quality</span>
        </nav>

        <CityHero
          cityName={data.name}
          country={data.country}
          aqi={aq?.aqi ?? null}
          updatedAt={aq?.updated_at ?? null}
        />

        <TrackClick category="engagement" label="hero_cta_city">
          <Link
            href="/air-quality-today"
            className="block text-center py-3 text-sm font-semibold text-zinc-500 hover:text-white transition-colors"
          >
            Check your city&apos;s air quality →
          </Link>
        </TrackClick>

        {/* H2: Current Pollution Levels */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Current Pollution Levels in {data.name}
          </h2>
          <PollutantCards
            pm25={aq?.pm25 ?? null}
            pm10={aq?.pm10 ?? null}
            o3={aq?.o3 ?? null}
          />
        </section>

        <AdSlot slot="4286289660" />

        {/* H2: 24-Hour Trend */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            {data.name} Air Quality 24-Hour Trend
          </h2>
          <AQIChart history={data.history} />
        </section>

        <TextAnalysis
          cityName={data.name}
          citySlug={data.slug}
          country={data.country}
          airQuality={aq}
          history={data.history}
        />

        <AdSlot slot="1237454490" />

        {/* H2: Historical Data */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent {data.name} Air Quality Measurements
          </h2>
          <HistorySection history={data.history} />
        </section>

        <AdSlot slot="4617195255" />

        <CityFAQ cityName={data.name} aqi={aq?.aqi ?? null} pm25={aq?.pm25 ?? null} />

        <NearbyCities cities={enrichedNearbyCities} currentCity={data.name} currentSlug={data.slug} />

        <PopularCities currentSlug={data.slug} />

        {/* Compare with other cities */}
        {(() => {
          const cityCompares = COMPARE_PAIRS.filter(
            (p) => p.slugA === data.slug || p.slugB === data.slug
          ).slice(0, 4);
          if (cityCompares.length === 0) return null;
          return (
            <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
              <h2 className="text-lg font-bold text-white mb-4">Compare {data.name} With</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cityCompares.map((c) => (
                  <TrackClick key={c.slug} category="engagement" label={`compare_click_${c.slug}`}>
                    <Link
                      href={`/compare/${c.slug}`}
                      className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer"
                    >
                      <p className="text-sm font-semibold text-zinc-300">{c.label} →</p>
                    </Link>
                  </TrackClick>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Internal Links + CTA */}
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

        <TrackClick category="engagement" label="bottom_cta_city">
          <section className="text-center py-2">
            <Link
              href="/air-quality-today"
              className="inline-block px-8 py-4 rounded-2xl bg-[#121212] border border-[#1e1e1e] hover:border-zinc-600 hover:bg-[#1a1a1a] transition-all duration-200 cursor-pointer"
            >
              <p className="text-sm font-bold text-white">Check air quality in your city →</p>
            </Link>
          </section>
        </TrackClick>

        {/* SEO footer text */}
        <footer className="text-xs text-neutral-700 leading-relaxed border-t border-[#1e1e1e] pt-6 mt-8">
          <p>
            {data.name} air quality data is sourced from government monitoring stations and updated hourly.
            The Air Quality Index (AQI) is calculated using EPA standards based on PM2.5 concentrations.
            For health-sensitive decisions, consult local environmental authorities.
          </p>
          <p className="mt-2">
            DUST.FAZR provides real-time air quality monitoring for {data.nearbyCities.length > 0
              ? `${data.name} and ${data.nearbyCities.length} nearby cities`
              : data.name
            } in {data.country}.
          </p>
        </footer>
      </main>
    </>
  );
}
