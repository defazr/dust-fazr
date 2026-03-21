import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCityBySlug, getAllCitySlugs } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { CityHero } from "@/components/CityHero";
import { PollutantCards } from "@/components/PollutantCards";
import { AdSlot } from "@/components/AdSlot";
import { AQIChart } from "@/components/AQIChart";
import { TextAnalysis } from "@/components/TextAnalysis";
import { HistorySection } from "@/components/HistorySection";
import { NearbyCities } from "@/components/NearbyCities";
import { CityFAQ } from "@/components/FAQ";

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
    title: `${data.name} Air Quality Today (${aqiText}) – Is It Safe Right Now? PM2.5 Guide | DUST.FAZR`,
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
    },
    twitter: {
      card: "summary",
      title: `${data.name} Air Quality (${aqiText}) – Safe Right Now?`,
      description: `${data.name} air quality is ${level.toLowerCase()} today.${pm25Text} Check health guide.`,
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

        <AdSlot />

        {/* H2: 24-Hour Trend */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            {data.name} Air Quality 24-Hour Trend
          </h2>
          <AQIChart history={data.history} />
        </section>

        <TextAnalysis
          cityName={data.name}
          country={data.country}
          airQuality={aq}
          history={data.history}
        />

        <AdSlot />

        {/* H2: Historical Data */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent {data.name} Air Quality Measurements
          </h2>
          <HistorySection history={data.history} />
        </section>

        <CityFAQ cityName={data.name} aqi={aq?.aqi ?? null} pm25={aq?.pm25 ?? null} />

        <NearbyCities cities={data.nearbyCities} currentCity={data.name} currentSlug={data.slug} />

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
