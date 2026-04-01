import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getCityWithLatest } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { AdSlot } from "@/components/AdSlot";
import { KEYWORD_CITIES, findKeywordCity } from "@/lib/keyword-cities";

export const revalidate = 86400;

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
    title: `Why Is Air Quality Bad in ${data.name}? (${aqiText}) – Causes & Solutions`,
    description: `${data.name} air pollution causes explained. Current ${aqiText}. Learn why air quality is bad, major pollution sources, and what you can do to protect yourself. Updated hourly.`,
    keywords: [
      `why is air quality bad in ${data.name}`,
      `${data.name} air pollution causes`,
      `${data.name} pollution reasons`,
      `${data.name} smog causes`,
      `${data.name} air quality problems`,
    ],
    openGraph: {
      title: `Why Is Air Quality Bad in ${data.name}? (${aqiText}) | DUST.FAZR`,
      description: `Understand why ${data.name} has air pollution and what causes it.`,
      url: `${baseUrl}/why-is-air-quality-bad/${city}`,
      siteName: "DUST.FAZR",
      type: "website",
    },
    alternates: { canonical: `${baseUrl}/why-is-air-quality-bad/${city}` },
  };
}

// City-specific pollution context
const CITY_CONTEXT: Record<string, { causes: string[]; geography: string }> = {
  seoul: {
    causes: [
      "Vehicle emissions from heavy traffic congestion across the metropolitan area",
      "Transboundary pollution carried by westerly winds from industrial regions in China",
      "Seasonal yellow dust (hwangsa) from Mongolian and Chinese deserts in spring",
      "Industrial facilities in surrounding Gyeonggi Province",
      "Construction dust from ongoing urban development projects",
    ],
    geography: "Seoul sits in a basin surrounded by mountains, which can trap pollutants during atmospheric inversions. The Han River corridor provides some ventilation, but high-pressure weather systems often create stagnant conditions.",
  },
  tokyo: {
    causes: [
      "Dense traffic in the Greater Tokyo metropolitan area with over 38 million residents",
      "Industrial emissions from the Keihin industrial zone along Tokyo Bay",
      "Photochemical smog formation during hot summer months",
      "Asian dust events affecting air quality during spring seasons",
      "Heating systems and energy production during winter months",
    ],
    geography: "Tokyo is located on a coastal plain along Tokyo Bay. Sea breezes help disperse pollutants, but the surrounding mountains can trap pollution during certain weather conditions. The urban heat island effect intensifies smog formation in summer.",
  },
  beijing: {
    causes: [
      "Heavy industrial emissions from steel, cement, and chemical manufacturing",
      "Coal burning for residential heating during winter months",
      "Rapid urbanization and construction activity generating particulate matter",
      "Vehicle exhaust from millions of cars on congested roads",
      "Agricultural burning in surrounding Hebei Province during harvest seasons",
    ],
    geography: "Beijing is surrounded by mountains on three sides, creating a natural bowl that traps pollutants. Winter temperature inversions seal pollution close to the ground. Winds from the northwest can bring desert dust, while calm conditions allow industrial emissions to accumulate.",
  },
  "new-york": {
    causes: [
      "Dense traffic congestion across Manhattan, bridges, and tunnels",
      "Building heating systems burning oil and natural gas in winter",
      "Regional power plant emissions affecting the broader Northeast corridor",
      "Port and shipping activity along the harbor and waterways",
      "Wildfire smoke transported from western states during summer months",
    ],
    geography: "New York City benefits from coastal breezes that help disperse pollutants. However, the dense urban canyon effect in Manhattan can trap emissions at street level. Heat waves can create ground-level ozone alerts during summer.",
  },
  london: {
    causes: [
      "Road transport emissions, especially diesel vehicles in central London",
      "Residential wood burning, which has increased in recent years",
      "Continental air masses carrying pollution from mainland Europe",
      "Construction activity across major infrastructure projects",
      "Domestic and commercial heating systems during cold months",
    ],
    geography: "London sits in the Thames Valley, which can trap pollution during temperature inversions. The city's relatively mild, damp climate can cause pollutants to linger. The congested central area sees concentrated emissions, which is why the Ultra Low Emission Zone was introduced.",
  },
};

function getAnalysis(name: string, cityKey: string, aqi: number | null, pm25: number | null): string[] {
  const ctx = CITY_CONTEXT[cityKey];
  const paragraphs: string[] = [];

  if (aqi != null) {
    if (aqi > 100) {
      paragraphs.push(
        `${name} is currently experiencing elevated air pollution with an AQI of ${aqi}. This level is considered ${aqi > 200 ? "very unhealthy" : aqi > 150 ? "unhealthy" : "unhealthy for sensitive groups"}, indicating that multiple pollution sources are contributing to poor air quality conditions.`
      );
    } else if (aqi > 50) {
      paragraphs.push(
        `${name}'s air quality is currently Moderate with an AQI of ${aqi}. While not immediately dangerous for most people, this level indicates ongoing pollution sources are active. Understanding these causes helps explain why air quality fluctuates throughout the day and across seasons.`
      );
    } else {
      paragraphs.push(
        `${name} currently has good air quality with an AQI of ${aqi}. However, the city regularly experiences pollution episodes due to various factors. Understanding these causes helps residents prepare for poor air quality days.`
      );
    }
  } else {
    paragraphs.push(
      `${name} regularly experiences air quality fluctuations due to multiple pollution sources. Understanding these causes can help you take protective measures during high-pollution periods.`
    );
  }

  if (ctx) {
    paragraphs.push(ctx.geography);
  }

  if (pm25 != null) {
    const whoStatus = pm25 > 45 ? "significantly exceeds" : pm25 > 15 ? "exceeds" : "is within";
    paragraphs.push(
      `The current PM2.5 level in ${name} is ${pm25} µg/m³, which ${whoStatus} the WHO annual guideline of 15 µg/m³. PM2.5 is produced by combustion sources including vehicles, industry, and heating systems, and can penetrate deep into the respiratory system.`
    );
  }

  return paragraphs;
}

export default async function WhyIsAirBadPage({ params }: PageProps) {
  const { city } = await params;
  const kc = findKeywordCity(city);
  if (!kc) notFound();

  const data = await getCityWithLatest(kc.dbSlug);
  if (!data) notFound();

  const info = getAqiInfo(data.aqi);
  const analysis = getAnalysis(data.name, kc.city, data.aqi, data.pm25);
  const ctx = CITY_CONTEXT[kc.city];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: `Why Is Air Bad in ${data.name}?`, item: `${baseUrl}/why-is-air-quality-bad/${city}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Why is air quality bad in ${data.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Air quality in ${data.name} is affected by ${ctx ? ctx.causes.slice(0, 3).join(", ").toLowerCase() : "traffic, industrial emissions, and weather patterns"}. ${ctx ? ctx.geography : "Geographic and meteorological conditions can trap pollutants."}`,
        },
      },
      {
        "@type": "Question",
        name: `How can I protect myself from air pollution in ${data.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Monitor daily AQI levels, wear N95 masks when AQI exceeds 100, use air purifiers indoors, limit outdoor exercise during high-pollution periods, and keep windows closed on bad air quality days.`,
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
          <span className="text-neutral-400">Pollution Causes</span>
        </nav>

        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Why Is Air Quality Bad in {data.name}?
          </h1>
          <p className="text-5xl md:text-7xl font-black tracking-tight mt-4" style={{ color: info.color }}>
            {data.aqi ?? "—"}
          </p>
          <p className="text-lg font-semibold" style={{ color: info.color }}>
            {info.label}
          </p>
          <p className="text-xs text-zinc-600">
            Data from WAQI · Updated hourly
          </p>
        </section>

        <AdSlot slot="4286289660" />

        {/* Analysis */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Air Pollution in {data.name}: Current Situation
          </h2>
          <div className="space-y-4">
            {analysis.map((p, i) => (
              <p key={i} className="text-sm text-zinc-400 leading-relaxed">{p}</p>
            ))}
          </div>
        </section>

        {/* Causes */}
        {ctx && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              Major Causes of Air Pollution in {data.name}
            </h2>
            <div className="space-y-3">
              {ctx.causes.map((cause, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#121212] border border-[#1e1e1e] overflow-hidden">
                  <span className="text-lg font-black text-zinc-700 shrink-0">{i + 1}</span>
                  <p className="text-sm text-zinc-400 leading-relaxed">{cause}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <AdSlot slot="1237454490" />

        {/* Protection Tips */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            How to Protect Yourself in {data.name}
          </h2>
          <div className="space-y-3">
            {[
              "Check daily AQI levels before planning outdoor activities",
              "Wear N95/KN95 masks when AQI exceeds 100",
              "Use HEPA air purifiers indoors, especially in bedrooms",
              "Keep windows closed during high-pollution periods",
              "Avoid outdoor exercise during peak traffic hours (7-9 AM, 5-7 PM)",
              "Stay hydrated — water helps your body process inhaled particles",
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-[#121212] border border-[#1e1e1e] overflow-hidden">
                <span className="text-green-500 shrink-0">✓</span>
                <p className="text-sm text-zinc-400">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">Why is air quality bad in {data.name}?</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Air quality in {data.name} is affected by {ctx ? ctx.causes.slice(0, 3).join(", ").toLowerCase() : "traffic, industrial emissions, and weather patterns"}.
                {ctx ? ` ${ctx.geography.split(".")[0]}.` : ""}
              </p>
            </div>
            <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">How can I protect myself from air pollution in {data.name}?</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Monitor daily AQI levels, wear N95 masks when AQI exceeds 100, use air purifiers indoors,
                limit outdoor exercise during high-pollution periods, and keep windows closed on bad air quality days.
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
            <Link href={`/should-i-wear-mask/${city}`} className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Should I Wear a Mask? →</p>
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
            Air pollution analysis for {data.name} is based on real-time data from government monitoring stations via WAQI.
            Pollution cause information is sourced from environmental research and local government reports.
          </p>
        </footer>
      </main>
    </>
  );
}
