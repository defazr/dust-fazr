import { getAllCitiesWithLatest } from "@/lib/db";
import { Ticker } from "./Ticker";

const TICKER_SLUGS = [
  "seoul-air-quality",
  "tokyo-air-quality",
  "beijing-air-quality",
  "new-york-air-quality",
  "london-air-quality",
  "delhi-air-quality",
  "bangkok-air-quality",
  "paris-air-quality",
];

export async function TickerServer() {
  let tickerCities: { name: string; aqi: number | null }[] = [];
  try {
    const all = await getAllCitiesWithLatest();
    tickerCities = TICKER_SLUGS
      .map((slug) => all.find((c) => c.slug === slug))
      .filter((c): c is NonNullable<typeof c> => c != null)
      .map((c) => ({ name: c.name, aqi: c.aqi }));
  } catch {
    // DB not available
  }

  return <Ticker cities={tickerCities} />;
}
