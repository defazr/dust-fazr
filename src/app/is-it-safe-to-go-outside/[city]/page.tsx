import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getCityWithLatest } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { AdSlot } from "@/components/AdSlot";
import { KEYWORD_CITIES, findKeywordCity } from "@/lib/keyword-cities";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return KEYWORD_CITIES.map((c) => ({ city: c.city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const kc = findKeywordCity(city);
  if (!kc) return { title: "Not Found" };

  const data = await getCityWithLatest(kc.dbSlug);
  if (!data) return { title: "Not Found" };

  const aqiText = data.aqi != null ? `AQI ${data.aqi}` : "Live AQI";
  const level = data.aqi != null ? getAqiInfo(data.aqi).label : "Real-time";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  return {
    title: `Is It Safe to Go Outside in ${data.name} Today? (${aqiText}) | DUST.FAZR`,
    description: `${data.name} air quality is ${level} today (${aqiText}). Find out if it's safe to go outside, exercise, or take children outdoors. Health guide with PM2.5 data. Updated hourly.`,
    keywords: [
      `is it safe to go outside ${data.name}`,
      `${data.name} air quality safe`,
      `can I go outside ${data.name}`,
      `${data.name} outdoor safety`,
      `${data.name} AQI today`,
    ],
    openGraph: {
      title: `Is It Safe to Go Outside in ${data.name}? (${aqiText}) | DUST.FAZR`,
      description: `${data.name} air quality: ${level}. Check if outdoor activities are safe today.`,
      url: `${baseUrl}/is-it-safe-to-go-outside/${city}`,
      siteName: "DUST.FAZR",
      type: "website",
    },
    alternates: { canonical: `${baseUrl}/is-it-safe-to-go-outside/${city}` },
  };
}

function getSafetyAnalysis(name: string, aqi: number | null, pm25: number | null): string[] {
  if (aqi == null) {
    return [
      `Air quality data for ${name} is currently being updated. Check back soon for the latest outdoor safety assessment.`,
      `In general, monitor local air quality reports before spending extended time outdoors, especially if you have respiratory conditions.`,
    ];
  }

  const paragraphs: string[] = [];

  if (aqi <= 50) {
    paragraphs.push(
      `Yes, it is safe to go outside in ${name} today. The current AQI is ${aqi} (Good), which means air quality is satisfactory and poses little or no health risk. You can freely enjoy all outdoor activities including jogging, cycling, and spending time in parks.`
    );
    paragraphs.push(
      `Children, elderly, and people with respiratory conditions can also safely enjoy outdoor activities without any precautions. This is an ideal day for outdoor exercise in ${name}.`
    );
  } else if (aqi <= 100) {
    paragraphs.push(
      `${name} air quality is Moderate today with an AQI of ${aqi}. It is generally safe to go outside for most people. However, unusually sensitive individuals — those with severe asthma or respiratory conditions — may notice minor symptoms during prolonged outdoor exertion.`
    );
    paragraphs.push(
      `For most residents and visitors, outdoor activities are perfectly fine. If you have pre-existing respiratory or heart conditions, consider reducing intense outdoor exercise and monitoring how you feel.`
    );
  } else if (aqi <= 150) {
    paragraphs.push(
      `Caution is advised in ${name} today. The AQI is ${aqi} (Unhealthy for Sensitive Groups). While healthy adults can still go outside, children, elderly people, and those with respiratory or heart conditions should limit prolonged outdoor exposure.`
    );
    paragraphs.push(
      `Consider moving intense physical activities indoors. If you must exercise outside, take frequent breaks and reduce the duration. Watch for symptoms like coughing, throat irritation, or shortness of breath.`
    );
  } else {
    paragraphs.push(
      `It is not recommended to go outside in ${name} today. The AQI is ${aqi} (${aqi <= 200 ? "Unhealthy" : aqi <= 300 ? "Very Unhealthy" : "Hazardous"}). Everyone may experience health effects, and sensitive groups face serious risks.`
    );
    paragraphs.push(
      `Stay indoors with windows closed. If you must go outside, wear an N95 mask and limit your time outdoors. Use air purifiers indoors. ${aqi > 200 ? "This is a health alert situation — avoid all outdoor activities." : "Reduce prolonged outdoor exertion significantly."}`
    );
  }

  if (pm25 != null) {
    const whoStatus = pm25 > 45 ? "exceeds the WHO 24-hour guideline of 45 µg/m³" : pm25 > 15 ? "is above the WHO annual guideline of 15 µg/m³" : "is within WHO guidelines";
    paragraphs.push(
      `Current PM2.5 levels in ${name} are ${pm25} µg/m³, which ${whoStatus}. PM2.5 particles are small enough to penetrate deep into the lungs and affect cardiovascular health with prolonged exposure.`
    );
  }

  return paragraphs;
}

export default async function IsItSafePage({ params }: PageProps) {
  const { city } = await params;
  const kc = findKeywordCity(city);
  if (!kc) notFound();

  const data = await getCityWithLatest(kc.dbSlug);
  if (!data) notFound();

  const info = getAqiInfo(data.aqi);
  const analysis = getSafetyAnalysis(data.name, data.aqi, data.pm25);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: `Is It Safe to Go Outside in ${data.name}?`, item: `${baseUrl}/is-it-safe-to-go-outside/${city}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is it safe to go outside in ${data.name} today?`,
        acceptedAnswer: { "@type": "Answer", text: analysis[0] },
      },
      {
        "@type": "Question",
        name: `Can I exercise outdoors in ${data.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: data.aqi != null && data.aqi <= 100
            ? `Yes, outdoor exercise is generally safe in ${data.name} with the current AQI of ${data.aqi}. Sensitive individuals should monitor symptoms during intense activity.`
            : `Outdoor exercise is not recommended in ${data.name} right now (AQI ${data.aqi ?? "N/A"}). Consider indoor alternatives until air quality improves.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
          <a href="/" className="hover:text-neutral-300 transition-colors">Home</a>
          <span className="mx-2 text-neutral-800">/</span>
          <a href={`/air-quality/${kc.dbSlug}`} className="hover:text-neutral-300 transition-colors">{data.name}</a>
          <span className="mx-2 text-neutral-800">/</span>
          <span className="text-neutral-400">Outdoor Safety</span>
        </nav>

        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Is It Safe to Go Outside in {data.name}?
          </h1>
          <p className="text-5xl md:text-7xl font-black tracking-tight mt-4" style={{ color: info.color }}>
            {data.aqi ?? "—"}
          </p>
          <p className="text-lg font-semibold" style={{ color: info.color }}>
            {info.label}
          </p>
          <p className="text-xs text-zinc-600">
            Data from OpenAQ · Updated hourly
          </p>
        </section>

        <AdSlot slot="4286289660" />

        {/* Safety Analysis */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Outdoor Safety Assessment for {data.name}
          </h2>
          <div className="space-y-4">
            {analysis.map((p, i) => (
              <p key={i} className="text-sm text-zinc-400 leading-relaxed">{p}</p>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 text-center overflow-hidden">
            <p className="text-xs text-zinc-500 mb-1">PM2.5</p>
            <p className="text-2xl font-black text-white">{data.pm25 != null ? `${data.pm25}` : "—"}</p>
            <p className="text-[10px] text-zinc-600 mt-1">µg/m³</p>
          </div>
          <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 text-center overflow-hidden">
            <p className="text-xs text-zinc-500 mb-1">PM10</p>
            <p className="text-2xl font-black text-white">{data.pm10 != null ? `${data.pm10}` : "—"}</p>
            <p className="text-[10px] text-zinc-600 mt-1">µg/m³</p>
          </div>
        </section>

        <AdSlot slot="1237454490" />

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">Is it safe to go outside in {data.name} today?</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{analysis[0]}</p>
            </div>
            <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">Can I exercise outdoors in {data.name}?</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                {data.aqi != null && data.aqi <= 100
                  ? `Yes, outdoor exercise is generally safe in ${data.name} with the current AQI of ${data.aqi}. Sensitive individuals should monitor symptoms during intense activity.`
                  : `Outdoor exercise is not recommended in ${data.name} right now (AQI ${data.aqi ?? "N/A"}). Consider indoor alternatives until air quality improves.`}
              </p>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4">Related</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href={`/air-quality/${kc.dbSlug}`} className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">{data.name} Air Quality →</p>
            </Link>
            <Link href={`/should-i-wear-mask/${city}`} className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Should I Wear a Mask in {data.name}? →</p>
            </Link>
            <Link href={`/why-is-air-quality-bad/${city}`} className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Why Is Air Bad in {data.name}? →</p>
            </Link>
            <Link href="/top-most-polluted-cities" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Most Polluted Cities →</p>
            </Link>
          </div>
        </section>

        <section className="text-center py-2">
          <Link href="/air-quality-today" className="inline-block px-8 py-4 rounded-2xl bg-[#121212] border border-[#1e1e1e] hover:border-zinc-600 hover:bg-[#1a1a1a] transition-all duration-200 cursor-pointer">
            <p className="text-sm font-bold text-white">Check air quality in your city →</p>
          </Link>
        </section>

        <AdSlot slot="4617195255" />

        <footer className="text-xs text-neutral-700 leading-relaxed border-t border-[#1e1e1e] pt-6">
          <p>
            Outdoor safety assessment for {data.name} is based on real-time AQI data from government monitoring stations via OpenAQ.
            AQI follows EPA standards. For medical advice, consult a healthcare professional.
          </p>
        </footer>
      </main>
    </>
  );
}
