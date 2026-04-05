import Link from "next/link";
import { getAllCitiesWithLatest } from "@/lib/db";
import { getAqiInfo } from "@/lib/aqi";
import { CitySearch } from "@/components/CitySearch";

export const revalidate = 3600;

const TOP_CITY_SLUGS = [
  "seoul-air-quality",
  "tokyo-air-quality",
  "beijing-air-quality",
  "shanghai-air-quality",
  "sydney-air-quality",
  "new-york-air-quality",
  "london-air-quality",
  "bangkok-air-quality",
  "singapore-air-quality",
  "mexico-city-air-quality",
  "vancouver-air-quality",
  "cairo-air-quality",
];

const QUICK_LINKS = [
  { name: "Seoul", slug: "seoul-air-quality" },
  { name: "Tokyo", slug: "tokyo-air-quality" },
  { name: "Beijing", slug: "beijing-air-quality" },
  { name: "New York", slug: "new-york-air-quality" },
];

export default async function Home() {
  let cities: Awaited<ReturnType<typeof getAllCitiesWithLatest>> = [];
  try {
    cities = await getAllCitiesWithLatest();
  } catch {
    // DB not available yet
  }

  const topCities = TOP_CITY_SLUGS
    .map((slug) => cities.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => c != null && c.aqi != null);

  const searchCities = cities.map((c) => ({
    name: c.name,
    slug: c.slug,
    country: c.country,
  }));

  return (
    <main className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
            DUST<span className="text-neutral-700">.</span>FAZR
          </h1>
          <p className="text-neutral-500 text-lg md:text-xl font-medium">
            Real-time air quality for cities worldwide
          </p>
        </div>

        <CitySearch cities={searchCities} />

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.slug}
              href={`/air-quality/${link.slug}`}
              className="text-sm text-zinc-500 hover:text-white border border-[#1e1e1e] hover:border-zinc-600 rounded-full px-4 py-1.5 transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/top-most-polluted-cities"
            className="text-sm text-zinc-500 hover:text-white border border-[#1e1e1e] hover:border-zinc-600 rounded-full px-4 py-1.5 transition-all duration-200"
          >
            Most Polluted →
          </Link>
        </div>
      </section>

      {/* ── Top Cities Section ── */}
      {topCities.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-8">
            Air Quality in Major Cities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topCities.map((city) => {
              const info = getAqiInfo(city.aqi);
              return (
                <Link
                  key={city.id}
                  href={`/air-quality/${city.slug}`}
                  className="group block p-6 md:p-8 rounded-2xl border border-[#1e1e1e] bg-[#121212] hover:border-zinc-600 hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="font-bold text-lg text-neutral-200 group-hover:text-white transition-colors truncate">
                      {city.name}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 ml-6 -mt-2 mb-4">
                    {city.country}
                  </p>
                  <p
                    className="text-5xl md:text-6xl font-black tracking-tight"
                    style={{ color: info.color }}
                  >
                    {city.aqi}
                  </p>
                  <p className="text-xs text-neutral-600 mt-2 font-semibold uppercase tracking-wider">
                    AQI
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── All Cities Section ── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">
          Browse All Cities
        </h2>

        {cities.length === 0 ? (
          <p className="text-center text-neutral-700 py-12">
            No cities loaded yet. Run the collector to populate data.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {cities.map((city) => {
              const info = getAqiInfo(city.aqi);
              return (
                <Link
                  key={city.id}
                  href={`/air-quality/${city.slug}`}
                  className="group block p-5 rounded-2xl border border-[#1e1e1e] bg-[#121212] shadow-sm shadow-black/10 hover:border-zinc-600 hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 overflow-hidden cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="font-semibold text-sm text-neutral-300 group-hover:text-white transition-colors truncate">
                      {city.name}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 mt-1 ml-5">
                    {city.country}
                  </p>
                  <p
                    className="text-3xl font-black mt-3 tracking-tight"
                    style={{ color: info.color }}
                  >
                    {city.aqi != null ? city.aqi : (
                      <span className="text-lg font-medium text-neutral-700">No data yet</span>
                    )}
                  </p>
                  {city.aqi != null && (
                    <p className="text-[10px] text-neutral-700 mt-1 font-medium uppercase tracking-wider">
                      AQI
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
