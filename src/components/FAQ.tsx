import { getAqiInfo } from "@/lib/aqi";

interface FAQItem {
  question: string;
  answer: string;
}

function generateCityFAQ(cityName: string, aqi: number | null, pm25: number | null): FAQItem[] {
  const info = getAqiInfo(aqi);
  const safeAnswer = aqi !== null
    ? aqi <= 50
      ? `Yes, ${cityName} air quality is currently good with an AQI of ${aqi}. Outdoor activities are safe for everyone.`
      : aqi <= 100
        ? `${cityName} air quality is moderate today with an AQI of ${aqi}. Most people can safely go outside, but unusually sensitive individuals may experience minor symptoms.`
        : aqi <= 150
          ? `${cityName} air quality is unhealthy for sensitive groups today (AQI ${aqi}). Children, elderly, and people with respiratory conditions should limit prolonged outdoor exposure.`
          : `${cityName} air quality is unhealthy today (AQI ${aqi}). Everyone should reduce outdoor activities. Consider wearing an N95 mask if you must go outside.`
    : `${cityName} air quality data is being updated. Check back soon for the latest conditions.`;

  const maskAnswer = aqi !== null
    ? aqi <= 100
      ? `With ${cityName}'s current AQI of ${aqi}, masks are generally not necessary for most people. However, if you have respiratory conditions, a mask may provide additional comfort.`
      : `With ${cityName}'s AQI at ${aqi}, wearing an N95 mask is recommended for outdoor activities, especially for sensitive groups. ${pm25 !== null && pm25 > 35.4 ? `PM2.5 levels are at ${pm25} µg/m³, which exceeds the EPA moderate threshold.` : ""}`
    : `Check the current AQI level before deciding. Generally, masks are recommended when AQI exceeds 100.`;

  return [
    {
      question: `Is air quality in ${cityName} safe today?`,
      answer: safeAnswer,
    },
    {
      question: "What AQI level is considered unhealthy?",
      answer: "According to EPA standards, AQI 0-50 is Good, 51-100 is Moderate, 101-150 is Unhealthy for Sensitive Groups, 151-200 is Unhealthy, 201-300 is Very Unhealthy, and above 300 is Hazardous. The WHO recommends annual PM2.5 levels below 15 µg/m³ for optimal health.",
    },
    {
      question: `Should I wear a mask today in ${cityName}?`,
      answer: maskAnswer,
    },
  ];
}

function generateCompareFAQ(cityA: string, cityB: string, aqiA: number | null, aqiB: number | null): FAQItem[] {
  const worse = aqiA !== null && aqiB !== null
    ? aqiA > aqiB ? cityA : cityB
    : "Data unavailable";
  const safer = aqiA !== null && aqiB !== null
    ? aqiA <= aqiB ? cityA : cityB
    : "Data unavailable";

  return [
    {
      question: `Which city has worse air quality today, ${cityA} or ${cityB}?`,
      answer: aqiA !== null && aqiB !== null
        ? `${worse} currently has worse air quality with an AQI of ${Math.max(aqiA, aqiB)} compared to ${safer}'s AQI of ${Math.min(aqiA, aqiB)}. This data is updated hourly from government monitoring stations.`
        : `Air quality comparison data is being updated. Check back soon.`,
    },
    {
      question: `Is it safer to be in ${cityA} or ${cityB} right now?`,
      answer: aqiA !== null && aqiB !== null
        ? `Based on current AQI levels, ${safer} (AQI ${Math.min(aqiA, aqiB)}) has safer air quality than ${worse} (AQI ${Math.max(aqiA, aqiB)}). ${Math.max(aqiA, aqiB) > 100 ? `People in ${worse} should consider limiting outdoor activities.` : "Both cities have acceptable air quality for outdoor activities."}`
        : `Check the latest AQI data for both cities to make an informed decision.`,
    },
  ];
}

export function CityFAQ({ cityName, aqi, pm25 }: { cityName: string; aqi: number | null; pm25: number | null }) {
  const faqs = generateCityFAQ(cityName, aqi, pm25);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">{faq.question}</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function CompareFAQ({ cityA, cityB, aqiA, aqiB }: { cityA: string; cityB: string; aqiA: number | null; aqiB: number | null }) {
  const faqs = generateCompareFAQ(cityA, cityB, aqiA, aqiB);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-5 overflow-hidden">
              <h3 className="text-sm font-bold text-white">{faq.question}</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
