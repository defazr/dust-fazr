import { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = false; // Static page, no revalidation needed

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr";

export const metadata: Metadata = {
  title: "AQI Scale Explained (PM2.5 Levels & Health Effects) – What Do the Numbers Mean?",
  description:
    "Understand the Air Quality Index (AQI) scale from 0 to 500. Learn what PM2.5 levels mean for your health, when to wear a mask, and when to stay indoors. Complete AQI guide.",
  keywords: [
    "AQI scale",
    "AQI explained",
    "air quality index scale",
    "what is AQI",
    "PM2.5 levels explained",
    "AQI health effects",
    "AQI chart",
    "unhealthy AQI level",
    "AQI meaning",
  ],
  openGraph: {
    title: "AQI Scale Explained — What Do the Numbers Mean? | DUST.FAZR",
    description: "Complete guide to understanding the Air Quality Index. PM2.5 levels, health effects, and action guide.",
    url: `${baseUrl}/aqi-scale-explained`,
    siteName: "DUST.FAZR",
    type: "article",
  },
  alternates: { canonical: `${baseUrl}/aqi-scale-explained` },
};

const AQI_GUIDE = [
  {
    range: "0–50",
    label: "Good",
    color: "#22c55e",
    pm25: "0–12.0 µg/m³",
    health: "Air quality is satisfactory. Air pollution poses little or no risk.",
    action: "Enjoy outdoor activities freely. No precautions needed.",
  },
  {
    range: "51–100",
    label: "Moderate",
    color: "#eab308",
    pm25: "12.1–35.4 µg/m³",
    health: "Air quality is acceptable. However, unusually sensitive people may experience minor respiratory symptoms.",
    action: "Most people can continue outdoor activities normally. Sensitive individuals should monitor symptoms.",
  },
  {
    range: "101–150",
    label: "Unhealthy for Sensitive Groups",
    color: "#f97316",
    pm25: "35.5–55.4 µg/m³",
    health: "Members of sensitive groups (children, elderly, people with respiratory or heart conditions) may experience health effects. The general public is less likely to be affected.",
    action: "Sensitive groups should limit prolonged outdoor exertion. Consider moving activities indoors.",
  },
  {
    range: "151–200",
    label: "Unhealthy",
    color: "#ef4444",
    pm25: "55.5–150.4 µg/m³",
    health: "Everyone may begin to experience health effects. Sensitive groups may experience more serious effects.",
    action: "Everyone should reduce prolonged outdoor exertion. Consider wearing an N95 mask outdoors. Use air purifiers indoors.",
  },
  {
    range: "201–300",
    label: "Very Unhealthy",
    color: "#a855f7",
    pm25: "150.5–250.4 µg/m³",
    health: "Health alert: everyone may experience more serious health effects including respiratory irritation and aggravation of heart or lung disease.",
    action: "Avoid all outdoor physical activities. Keep windows closed. Use N95 masks if you must go outside. Run air purifiers continuously.",
  },
  {
    range: "301–500",
    label: "Hazardous",
    color: "#991b1b",
    pm25: "250.5+ µg/m³",
    health: "Health warning of emergency conditions. The entire population is at risk of serious health effects.",
    action: "Stay indoors with air purification. Avoid all outdoor activities. Seal windows and doors. Seek medical attention if experiencing symptoms.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a good AQI level?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An AQI of 0-50 is considered 'Good.' Air quality is satisfactory and air pollution poses little or no risk. You can enjoy outdoor activities without any health concerns.",
      },
    },
    {
      "@type": "Question",
      name: "At what AQI should I wear a mask?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You should consider wearing an N95 mask when AQI exceeds 150 (Unhealthy). At AQI 101-150, sensitive groups should take precautions. Above 200, everyone should wear masks outdoors.",
      },
    },
    {
      "@type": "Question",
      name: "What is PM2.5 and why is it dangerous?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PM2.5 refers to fine particulate matter smaller than 2.5 micrometers. These particles are dangerous because they can penetrate deep into the lungs and enter the bloodstream, causing respiratory and cardiovascular problems. The WHO recommends annual PM2.5 levels below 15 µg/m³.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
    { "@type": "ListItem", position: 2, name: "AQI Scale Explained", item: `${baseUrl}/aqi-scale-explained` },
  ],
};

export default function AqiScaleExplainedPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
          <a href="/" className="hover:text-neutral-300 transition-colors">Home</a>
          <span className="mx-2 text-neutral-800">/</span>
          <span className="text-neutral-400">AQI Scale Explained</span>
        </nav>

        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            AQI Scale Explained
          </h1>
          <p className="text-lg text-zinc-500 font-medium">
            PM2.5 Levels & Health Effects
          </p>
          <p className="text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
            The Air Quality Index (AQI) measures air pollution on a scale of 0 to 500.
            Higher values mean more pollution and greater health risk.
          </p>
        </section>

        <AdSlot slot="4286289660" />

        {/* AQI Scale Guide */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">AQI Levels at a Glance</h2>
          <div className="space-y-4">
            {AQI_GUIDE.map((level) => (
              <div
                key={level.range}
                className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 md:p-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: level.color }}
                  />
                  <h3 className="text-base font-bold" style={{ color: level.color }}>
                    {level.label} (AQI {level.range})
                  </h3>
                </div>
                <div className="space-y-2 pl-7">
                  <p className="text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-400">PM2.5:</span> {level.pm25}
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    <span className="font-semibold text-zinc-300">Health Effects:</span> {level.health}
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    <span className="font-semibold text-zinc-300">What to Do:</span> {level.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <AdSlot slot="1237454490" />

        {/* What is PM2.5 */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">What is PM2.5?</h2>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 leading-relaxed">
              PM2.5 stands for Particulate Matter with a diameter of 2.5 micrometers or less — about 30 times
              smaller than a human hair. These microscopic particles are produced by vehicle exhaust, industrial
              emissions, wildfires, and other combustion sources.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              PM2.5 is considered the most dangerous common air pollutant because it can penetrate deep into the
              lungs and even enter the bloodstream. Long-term exposure is linked to respiratory disease, heart
              disease, stroke, and lung cancer. The World Health Organization recommends annual average PM2.5
              levels below 15 µg/m³ and 24-hour averages below 45 µg/m³.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">What is a good AQI level?</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                An AQI of 0–50 is considered &quot;Good.&quot; Air quality is satisfactory and air pollution poses
                little or no risk. You can enjoy outdoor activities without any health concerns.
              </p>
            </div>
            <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">At what AQI should I wear a mask?</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                You should consider wearing an N95 mask when AQI exceeds 150 (Unhealthy). At AQI 101–150,
                sensitive groups should take precautions. Above 200, everyone should wear masks outdoors.
              </p>
            </div>
            <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">What is PM2.5 and why is it dangerous?</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                PM2.5 refers to fine particulate matter smaller than 2.5 micrometers. These particles are
                dangerous because they can penetrate deep into the lungs and enter the bloodstream, causing
                respiratory and cardiovascular problems. The WHO recommends annual PM2.5 levels below 15 µg/m³.
              </p>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4">Check Air Quality Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/air-quality/seoul-air-quality" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Seoul Air Quality →</p>
            </Link>
            <Link href="/air-quality/tokyo-air-quality" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Tokyo Air Quality →</p>
            </Link>
            <Link href="/top-most-polluted-cities" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Most Polluted Cities →</p>
            </Link>
            <Link href="/compare/seoul-vs-tokyo-air-quality" className="block p-4 rounded-xl border border-[#1e1e1e] bg-black hover:bg-[#0e0e0e] hover:border-zinc-700 transition-all duration-200 cursor-pointer">
              <p className="text-sm font-semibold text-zinc-300">Seoul vs Tokyo →</p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-4">
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
            AQI values follow EPA standards. PM2.5 breakpoints are based on the 2024 EPA National
            Ambient Air Quality Standards. Health recommendations align with WHO and EPA guidelines.
            For medical advice, consult a healthcare professional.
          </p>
        </footer>
      </main>
    </>
  );
}
