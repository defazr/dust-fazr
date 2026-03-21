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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  return {
    title: `Should I Wear a Mask in ${data.name} Today? (${aqiText}) – N95 Guide | DUST.FAZR`,
    description: `${data.name} ${aqiText}: Do you need a mask today? When to wear N95 masks, which masks work against PM2.5, and current pollution levels. Updated hourly.`,
    keywords: [
      `should I wear mask ${data.name}`,
      `${data.name} mask recommendation`,
      `N95 mask ${data.name}`,
      `${data.name} air pollution mask`,
      `${data.name} PM2.5 mask`,
    ],
    openGraph: {
      title: `Should I Wear a Mask in ${data.name}? (${aqiText}) | DUST.FAZR`,
      description: `${data.name} mask guide based on current air quality data.`,
      url: `${baseUrl}/should-i-wear-mask/${city}`,
      siteName: "DUST.FAZR",
      type: "website",
    },
    alternates: { canonical: `${baseUrl}/should-i-wear-mask/${city}` },
  };
}

function getMaskAnalysis(name: string, aqi: number | null, pm25: number | null): string[] {
  if (aqi == null) {
    return [
      `Air quality data for ${name} is being updated. As a general rule, consider wearing an N95 mask when AQI exceeds 100, especially if you have respiratory conditions.`,
      `Regular surgical or cloth masks do not effectively filter PM2.5 particles. Only N95 or KN95 rated masks provide adequate protection against fine particulate matter.`,
    ];
  }

  const paragraphs: string[] = [];

  if (aqi <= 50) {
    paragraphs.push(
      `No, you do not need to wear a mask in ${name} today. The AQI is ${aqi} (Good), which means the air is clean and safe to breathe without any protection. Even people with respiratory conditions can comfortably breathe outdoor air.`
    );
  } else if (aqi <= 100) {
    paragraphs.push(
      `Masks are generally not necessary in ${name} today. The AQI is ${aqi} (Moderate), which is acceptable for most people. However, if you have severe asthma, COPD, or other respiratory conditions, a mask may provide extra comfort during extended outdoor time.`
    );
  } else if (aqi <= 150) {
    paragraphs.push(
      `Sensitive groups should consider wearing an N95 mask in ${name} today. The AQI is ${aqi} (Unhealthy for Sensitive Groups). Children, elderly, pregnant women, and people with respiratory or heart conditions should wear masks for prolonged outdoor exposure.`
    );
  } else {
    paragraphs.push(
      `Yes, you should wear an N95 mask in ${name} today. The AQI is ${aqi} (${aqi <= 200 ? "Unhealthy" : aqi <= 300 ? "Very Unhealthy" : "Hazardous"}). Everyone should wear proper respiratory protection when going outside. ${aqi > 200 ? "Avoid going outside if possible." : "Limit outdoor time."}`
    );
  }

  paragraphs.push(
    `Only N95 or KN95 masks effectively filter PM2.5 particles. Regular cloth masks and surgical masks do not provide adequate protection against fine particulate matter. Make sure your mask fits snugly around your nose and mouth with no gaps.`
  );

  if (pm25 != null) {
    paragraphs.push(
      `Current PM2.5 in ${name} is ${pm25} µg/m³. ${pm25 > 35.4 ? `This exceeds the EPA "Moderate" threshold of 35.4 µg/m³, making mask use more important for outdoor activities.` : pm25 > 12 ? `This is in the Moderate range. Masks are optional for healthy adults but recommended for sensitive individuals.` : `This is within safe levels. No mask needed for air quality reasons.`}`
    );
  }

  return paragraphs;
}

export default async function ShouldIWearMaskPage({ params }: PageProps) {
  const { city } = await params;
  const kc = findKeywordCity(city);
  if (!kc) notFound();

  const data = await getCityWithLatest(kc.dbSlug);
  if (!data) notFound();

  const info = getAqiInfo(data.aqi);
  const analysis = getMaskAnalysis(data.name, data.aqi, data.pm25);
  const needsMask = data.aqi != null && data.aqi > 100;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: `Mask Guide: ${data.name}`, item: `${baseUrl}/should-i-wear-mask/${city}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Should I wear a mask in ${data.name} today?`,
        acceptedAnswer: { "@type": "Answer", text: analysis[0] },
      },
      {
        "@type": "Question",
        name: "What type of mask protects against PM2.5?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Only N95 or KN95 masks effectively filter PM2.5 particles. Regular cloth masks and surgical masks do not provide adequate protection. Ensure the mask fits snugly with no gaps around the nose and mouth.",
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
          <span className="text-neutral-400">Mask Guide</span>
        </nav>

        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Should I Wear a Mask in {data.name}?
          </h1>
          <p className="text-5xl md:text-7xl font-black tracking-tight mt-4" style={{ color: info.color }}>
            {data.aqi ?? "—"}
          </p>
          <p className="text-lg font-semibold" style={{ color: info.color }}>
            {needsMask ? "Mask Recommended" : "Mask Not Needed"}
          </p>
          <p className="text-xs text-zinc-600">
            Data from OpenAQ · Updated hourly
          </p>
        </section>

        <AdSlot slot="4286289660" />

        {/* Analysis */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Mask Recommendation for {data.name} Today
          </h2>
          <div className="space-y-4">
            {analysis.map((p, i) => (
              <p key={i} className="text-sm text-zinc-400 leading-relaxed">{p}</p>
            ))}
          </div>
        </section>

        {/* When to Wear Guide */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">When Should You Wear a Mask?</h2>
          <div className="space-y-3">
            {[
              { range: "0–50", label: "Good", verdict: "No mask needed", color: "#22c55e" },
              { range: "51–100", label: "Moderate", verdict: "Optional for sensitive groups", color: "#eab308" },
              { range: "101–150", label: "USG", verdict: "Recommended for sensitive groups", color: "#f97316" },
              { range: "151–200", label: "Unhealthy", verdict: "N95 recommended for everyone", color: "#ef4444" },
              { range: "201–300", label: "Very Unhealthy", verdict: "N95 required outdoors", color: "#a855f7" },
              { range: "301+", label: "Hazardous", verdict: "Stay indoors, N95 if outside", color: "#991b1b" },
            ].map((row) => (
              <div key={row.range} className="flex items-center gap-3 p-3 rounded-xl bg-[#121212] border border-[#1e1e1e] overflow-hidden">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                <span className="text-xs font-bold text-zinc-500 w-16 shrink-0">AQI {row.range}</span>
                <span className="text-sm text-white flex-1">{row.verdict}</span>
              </div>
            ))}
          </div>
        </section>

        <AdSlot slot="1237454490" />

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">Should I wear a mask in {data.name} today?</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{analysis[0]}</p>
            </div>
            <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">What type of mask protects against PM2.5?</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Only N95 or KN95 masks effectively filter PM2.5 particles. Regular cloth masks and surgical masks
                do not provide adequate protection. Ensure the mask fits snugly with no gaps around the nose and mouth.
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
            <Link href={`/is-it-safe-to-go-outside/${city}`} className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Is It Safe to Go Outside? →</p>
            </Link>
            <Link href={`/why-is-air-quality-bad/${city}`} className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Why Is Air Bad in {data.name}? →</p>
            </Link>
            <Link href="/aqi-scale-explained" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">AQI Scale Explained →</p>
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
            Mask recommendations for {data.name} are based on real-time AQI data from government monitoring stations via OpenAQ.
            For medical advice about respiratory protection, consult a healthcare professional.
          </p>
        </footer>
      </main>
    </>
  );
}
