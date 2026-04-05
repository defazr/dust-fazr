import Link from "next/link";
import { getAqiInfo } from "@/lib/aqi";
import { COMPARE_PAIRS } from "@/lib/compare";
import type { AirQualityLatest, AirQualityHistory } from "@/lib/types";

interface Props {
  cityName: string;
  citySlug: string;
  country: string;
  airQuality: AirQualityLatest | null;
  history: AirQualityHistory[];
}

export function TextAnalysis({ cityName, citySlug, country, airQuality, history }: Props) {
  if (!airQuality || airQuality.aqi === null) {
    return (
      <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-4">Air Quality Analysis for {cityName}</h2>
        <p className="text-neutral-400 leading-relaxed">
          {cityName} air quality data is currently being updated. Real-time monitoring stations
          in {country} collect PM2.5, PM10, and other pollutant measurements hourly.
          Check back shortly for the latest air quality index and health recommendations for {cityName}.
        </p>
      </section>
    );
  }

  const info = getAqiInfo(airQuality.aqi);
  const aqi = airQuality.aqi;
  const pm25 = airQuality.pm25;
  const pm10 = airQuality.pm10;

  const pm25Values = history.map((h) => h.pm25).filter((v): v is number => v !== null);
  const avgPm25 = pm25Values.length > 0 ? pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length : null;

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "this morning" : hour < 17 ? "this afternoon" : "this evening";

  const whoExceeded = pm25 !== null && pm25 > 15;
  const who24hExceeded = pm25 !== null && pm25 > 45;

  let trendText = "";
  if (pm25 !== null && avgPm25 !== null) {
    const pctDiff = ((pm25 - avgPm25) / avgPm25) * 100;
    if (pctDiff > 20) {
      trendText = `PM2.5 concentration is ${Math.abs(pctDiff).toFixed(0)}% higher than the recent average of ${avgPm25.toFixed(1)} µg/m³, indicating worsening air quality conditions.`;
    } else if (pctDiff < -20) {
      trendText = `PM2.5 concentration has improved, currently ${Math.abs(pctDiff).toFixed(0)}% lower than the recent average of ${avgPm25.toFixed(1)} µg/m³.`;
    } else {
      trendText = `PM2.5 levels are stable, staying close to the recent average of ${avgPm25.toFixed(1)} µg/m³.`;
    }
  }

  return (
    <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden">
      <h2 className="text-xl font-bold text-white mb-6">Air Quality Analysis for {cityName}</h2>
      <div className="space-y-5 text-neutral-300 leading-[1.8] text-[15px]">
        <p>
          {cityName}, {country} air quality {timeOfDay} is rated{" "}
          <strong className="font-bold" style={{ color: info.color }}>{info.label}</strong> with an Air Quality Index (AQI) of{" "}
          <strong className="text-white font-bold">{aqi}</strong>.
          {pm25 !== null && (
            <> The primary pollutant PM2.5 is measured at <strong className="text-white font-bold">{pm25} µg/m³</strong>.</>
          )}
          {pm10 !== null && <> PM10 (coarse particles) is at <strong className="text-white font-bold">{pm10} µg/m³</strong>.</>}
        </p>

        {pm25 !== null && (
          <p>
            {who24hExceeded ? (
              <>The current PM2.5 level exceeds the WHO 24-hour guideline of 45 µg/m³. Prolonged exposure at this level poses health risks, particularly for vulnerable populations including children, elderly, and those with respiratory conditions.</>
            ) : whoExceeded ? (
              <>The current PM2.5 level exceeds the WHO annual guideline of 15 µg/m³ but remains within the 24-hour limit of 45 µg/m³. Long-term exposure at this level may still affect sensitive individuals.</>
            ) : (
              <>The current PM2.5 level is within WHO air quality guidelines, indicating relatively clean air conditions in {cityName} today.</>
            )}
          </p>
        )}

        {trendText && <p>{trendText}</p>}

        {/* Health recommendation */}
        <div
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: `${info.color}08`,
            borderColor: `${info.color}20`,
          }}
        >
          <p className="font-bold text-sm mb-2 uppercase tracking-wider" style={{ color: info.color }}>
            Health Recommendation
          </p>
          <p className="text-sm text-neutral-300 leading-relaxed">{getDetailedHealthAdvice(aqi, cityName)}</p>
        </div>

        {/* Activity cards */}
        <div className="grid grid-cols-2 gap-3">
          <ActivityCard
            label="Outdoor Exercise"
            safe={aqi <= 100}
            detail={aqi <= 50 ? "Ideal conditions" : aqi <= 100 ? "Acceptable for most" : aqi <= 150 ? "Reduce intensity" : "Avoid"}
          />
          <ActivityCard
            label="Window Ventilation"
            safe={aqi <= 100}
            detail={aqi <= 50 ? "Recommended" : aqi <= 100 ? "OK for short periods" : "Keep windows closed"}
          />
        </div>

        {/* Contextual internal links */}
        <p className="text-sm text-neutral-400 leading-relaxed">
          {(() => {
            const compare = COMPARE_PAIRS.find(
              (pair) => pair.slugA === citySlug || pair.slugB === citySlug
            );
            if (compare) {
              return (
                <>
                  Wondering how {cityName} compares?{" "}
                  <Link href={`/compare/${compare.slug}`} className="text-blue-400 hover:text-blue-300 underline transition-colors">
                    Check {compare.label} air quality comparison
                  </Link>
                  , explore the{" "}
                  <Link href="/aqi-scale-explained" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                    AQI scale explained
                  </Link>
                  , or see today&#39;s{" "}
                  <Link href="/top-most-polluted-cities" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                    global air quality rankings
                  </Link>
                  .
                </>
              );
            }
            return (
              <>
                Learn more about the{" "}
                <Link href="/aqi-scale-explained" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                  AQI scale explained
                </Link>
                , or see today&#39;s{" "}
                <Link href="/top-most-polluted-cities" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                  global air quality rankings
                </Link>
                .
              </>
            );
          })()}
        </p>
      </div>
    </section>
  );
}

function ActivityCard({ label, safe, detail }: { label: string; safe: boolean; detail: string }) {
  return (
    <div className={`rounded-xl p-4 border ${
      safe
        ? "border-green-500/10 bg-green-500/5"
        : "border-red-500/10 bg-red-500/5"
    }`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full ${safe ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm font-semibold text-neutral-200">{label}</span>
      </div>
      <p className="text-xs text-neutral-500">{detail}</p>
    </div>
  );
}

function getDetailedHealthAdvice(aqi: number, cityName: string): string {
  if (aqi <= 50) {
    return `Air quality in ${cityName} is excellent. All outdoor activities are safe. Perfect conditions for jogging, cycling, and outdoor sports.`;
  }
  if (aqi <= 100) {
    return `Air quality in ${cityName} is acceptable. Most people can enjoy outdoor activities normally. Unusually sensitive individuals should consider limiting prolonged outdoor exertion.`;
  }
  if (aqi <= 150) {
    return `Sensitive groups in ${cityName} — including children, elderly, and those with asthma or heart disease — should limit prolonged outdoor activity. Consider wearing an N95 mask if spending extended time outdoors.`;
  }
  if (aqi <= 200) {
    return `Everyone in ${cityName} should reduce prolonged outdoor exertion. Sensitive groups should avoid outdoor physical activity entirely. Use air purifiers indoors and keep windows closed.`;
  }
  if (aqi <= 300) {
    return `Health alert for ${cityName}: serious health effects possible for all residents. Avoid all outdoor physical activity. Use air purifiers and seal windows. Consider wearing N95 masks if outdoor exposure is unavoidable.`;
  }
  return `Emergency health warning for ${cityName}: hazardous air quality. All outdoor activity should be avoided. Remain indoors with air purification running. Seek medical attention if experiencing breathing difficulties.`;
}
