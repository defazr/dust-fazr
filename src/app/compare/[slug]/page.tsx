import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getCityWithLatest } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { COMPARE_PAIRS, parseCompareSlug, getRelatedComparisons } from "@/lib/compare";
import { CompareFAQ } from "@/components/FAQ";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return COMPARE_PAIRS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) return { title: "Not Found" };

  const [cityA, cityB] = await Promise.all([
    getCityWithLatest(parsed.slugA),
    getCityWithLatest(parsed.slugB),
  ]);
  if (!cityA || !cityB) return { title: "Not Found" };

  const aqiA = cityA.aqi != null ? `AQI ${cityA.aqi}` : "Live AQI";
  const aqiB = cityB.aqi != null ? `AQI ${cityB.aqi}` : "Live AQI";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  return {
    title: `${cityA.name} vs ${cityB.name} Air Quality (${aqiA} vs ${aqiB}) – Which Is Safer? | DUST.FAZR`,
    description: `${cityA.name} (${aqiA}) vs ${cityB.name} (${aqiB}): Which city has better air quality right now? Live PM2.5 comparison and health guide. Updated hourly.`,
    keywords: [
      `${cityA.name} vs ${cityB.name} air quality`,
      `${cityA.name} or ${cityB.name} safer`,
      `${cityA.name} air quality comparison`,
      `${cityB.name} air quality comparison`,
      "AQI comparison",
    ],
    openGraph: {
      title: `${cityA.name} vs ${cityB.name} – Which Has Better Air? | DUST.FAZR`,
      description: `Live comparison: ${cityA.name} ${aqiA} vs ${cityB.name} ${aqiB}. Find out which city is safer.`,
      url: `${baseUrl}/compare/${slug}`,
      siteName: "DUST.FAZR",
      type: "website",
    },
    alternates: {
      canonical: `${baseUrl}/compare/${slug}`,
    },
  };
}

function CompareCard({
  city,
  label,
}: {
  city: { name: string; country: string; aqi: number | null; pm25: number | null; pm10: number | null; slug: string };
  label: "A" | "B";
}) {
  const info = getAqiInfo(city.aqi);
  return (
    <div className="flex-1 rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
      <Link
        href={`/air-quality/${city.slug}`}
        className="text-lg font-bold text-white hover:text-zinc-300 transition-colors"
      >
        {city.name}
      </Link>
      <p className="text-xs text-zinc-600 mt-1">{city.country}</p>

      <p
        className="text-5xl md:text-7xl font-black mt-6 tracking-tight"
        style={{ color: info.color }}
      >
        {city.aqi ?? "—"}
      </p>
      <p
        className="text-sm font-semibold mt-2"
        style={{ color: info.color }}
      >
        {info.label}
      </p>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">PM2.5</span>
          <span className="text-white font-semibold">
            {city.pm25 != null ? `${city.pm25} µg/m³` : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">PM10</span>
          <span className="text-white font-semibold">
            {city.pm10 != null ? `${city.pm10} µg/m³` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function getVerdict(nameA: string, nameB: string, aqiA: number | null, aqiB: number | null) {
  if (aqiA == null || aqiB == null) {
    return `Air quality data is being updated for comparison.`;
  }
  if (aqiA > aqiB) {
    const diff = aqiA - aqiB;
    return `${nameA} currently has worse air quality than ${nameB} (AQI ${diff} points higher). ${
      aqiA > 100
        ? "Sensitive groups in " + nameA + " should limit outdoor activity."
        : "Both cities have acceptable air quality levels."
    }`;
  }
  if (aqiB > aqiA) {
    const diff = aqiB - aqiA;
    return `${nameB} currently has worse air quality than ${nameA} (AQI ${diff} points higher). ${
      aqiB > 100
        ? "Sensitive groups in " + nameB + " should limit outdoor activity."
        : "Both cities have acceptable air quality levels."
    }`;
  }
  return `${nameA} and ${nameB} currently have the same air quality level.`;
}

function getAnalysis(nameA: string, nameB: string, cityA: { aqi: number | null; pm25: number | null }, cityB: { aqi: number | null; pm25: number | null }) {
  const paragraphs: string[] = [];

  if (cityA.aqi != null && cityB.aqi != null) {
    const worse = cityA.aqi > cityB.aqi ? nameA : nameB;
    const better = cityA.aqi > cityB.aqi ? nameB : nameA;
    const worseAqi = Math.max(cityA.aqi, cityB.aqi);
    const betterAqi = Math.min(cityA.aqi, cityB.aqi);

    paragraphs.push(
      `Based on the latest measurements, ${worse} has an AQI of ${worseAqi} compared to ${better}'s AQI of ${betterAqi}. ` +
      `The World Health Organization (WHO) recommends annual PM2.5 levels below 15 µg/m³ and 24-hour levels below 45 µg/m³.`
    );
  }

  if (cityA.pm25 != null && cityB.pm25 != null) {
    const maxPm = Math.max(cityA.pm25, cityB.pm25);
    if (maxPm > 35.4) {
      paragraphs.push(
        `Current PM2.5 levels exceed the EPA "Moderate" threshold of 35.4 µg/m³. ` +
        `People with respiratory conditions, children, and the elderly should consider reducing prolonged outdoor exposure.`
      );
    } else if (maxPm > 12) {
      paragraphs.push(
        `PM2.5 levels are within the "Moderate" range. Air quality is generally acceptable, ` +
        `though unusually sensitive individuals may experience minor symptoms.`
      );
    } else {
      paragraphs.push(
        `PM2.5 levels in both cities are within WHO guidelines. ` +
        `Outdoor activities can be enjoyed without air quality concerns.`
      );
    }
  }

  paragraphs.push(
    `Air quality can change rapidly due to weather patterns, traffic, and industrial activity. ` +
    `Check back hourly for the latest comparison between ${nameA} and ${nameB}.`
  );

  return paragraphs;
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

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) notFound();

  const [cityA, cityB] = await Promise.all([
    getCityWithLatest(parsed.slugA),
    getCityWithLatest(parsed.slugB),
  ]);

  if (!cityA || !cityB) notFound();

  const verdict = getVerdict(cityA.name, cityB.name, cityA.aqi, cityB.aqi);
  const analysis = getAnalysis(cityA.name, cityB.name, cityA, cityB);
  const related = getRelatedComparisons(slug);
  const latestUpdate = cityA.updated_at || cityB.updated_at;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${cityA.name} vs ${cityB.name} Air Quality Comparison`,
    description: `Compare air quality between ${cityA.name} and ${cityB.name}`,
    url: `${baseUrl}/compare/${slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: `${cityA.name} vs ${cityB.name}`, item: `${baseUrl}/compare/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
          <a href="/" className="hover:text-neutral-300 transition-colors">Home</a>
          <span className="mx-2 text-neutral-800">/</span>
          <span className="text-neutral-400">{cityA.name} vs {cityB.name}</span>
        </nav>

        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {cityA.name} vs {cityB.name}
          </h1>
          <p className="text-lg text-zinc-500 font-medium">
            Live AQI Comparison
          </p>
          {latestUpdate && (
            <p className="text-xs text-zinc-600">
              Updated {formatTimeAgo(latestUpdate)} · Data from OpenAQ
            </p>
          )}
        </section>

        <AdSlot slot="4286289660" />

        {/* Compare Cards */}
        <section className="flex flex-col md:flex-row gap-4 md:gap-6">
          <CompareCard city={cityA} label="A" />
          <div className="flex items-center justify-center">
            <span className="text-2xl font-black text-zinc-700">VS</span>
          </div>
          <CompareCard city={cityB} label="B" />
        </section>

        {/* Verdict */}
        <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-3">Verdict</h2>
          <p className="text-sm text-zinc-300 leading-relaxed">{verdict}</p>
        </section>

        <AdSlot slot="1237454490" />

        {/* Analysis */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            {cityA.name} vs {cityB.name} Air Quality Analysis
          </h2>
          <div className="space-y-4">
            {analysis.map((p, i) => (
              <p key={i} className="text-sm text-zinc-400 leading-relaxed">{p}</p>
            ))}
          </div>
        </section>

        {/* Internal Links: City Pages */}
        <section className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/air-quality/${cityA.slug}`}
            className="flex-1 block p-5 rounded-2xl border border-[#1e1e1e] bg-[#121212] hover:border-zinc-600 hover:bg-[#1a1a1a] transition-all duration-200 text-center cursor-pointer"
          >
            <p className="text-sm text-zinc-500">View full report</p>
            <p className="text-lg font-bold text-white mt-1">{cityA.name} Air Quality →</p>
          </Link>
          <Link
            href={`/air-quality/${cityB.slug}`}
            className="flex-1 block p-5 rounded-2xl border border-[#1e1e1e] bg-[#121212] hover:border-zinc-600 hover:bg-[#1a1a1a] transition-all duration-200 text-center cursor-pointer"
          >
            <p className="text-sm text-zinc-500">View full report</p>
            <p className="text-lg font-bold text-white mt-1">{cityB.name} Air Quality →</p>
          </Link>
        </section>

        <CompareFAQ cityA={cityA.name} cityB={cityB.name} aqiA={cityA.aqi} aqiB={cityB.aqi} />

        <AdSlot slot="4617195255" />

        {/* Related Comparisons */}
        {related.length > 0 && (
          <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-4">More Comparisons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/compare/${r.slug}`}
                  className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer"
                >
                  <p className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
                    {r.label} →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO Footer */}
        <footer className="text-xs text-neutral-700 leading-relaxed border-t border-[#1e1e1e] pt-6">
          <p>
            Air quality comparison between {cityA.name} and {cityB.name} is based on real-time data
            from government monitoring stations via OpenAQ. AQI values are calculated using EPA standards.
            Data is updated hourly for accurate comparisons.
          </p>
        </footer>
      </main>
    </>
  );
}
