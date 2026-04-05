import Link from "next/link";

const POPULAR_CITIES = [
  { name: "Seoul", slug: "seoul-air-quality" },
  { name: "Tokyo", slug: "tokyo-air-quality" },
  { name: "Beijing", slug: "beijing-air-quality" },
  { name: "Shanghai", slug: "shanghai-air-quality" },
  { name: "Sydney", slug: "sydney-air-quality" },
  { name: "New York", slug: "new-york-air-quality" },
  { name: "London", slug: "london-air-quality" },
  { name: "Bangkok", slug: "bangkok-air-quality" },
];

const FALLBACK_CITIES = [
  { name: "Paris", slug: "paris-air-quality" },
  { name: "Singapore", slug: "singapore-air-quality" },
  { name: "Vancouver", slug: "vancouver-air-quality" },
  { name: "Cairo", slug: "cairo-air-quality" },
  { name: "Mexico City", slug: "mexico-city-air-quality" },
];

interface Props {
  currentSlug: string;
}

export function PopularCities({ currentSlug }: Props) {
  const cities = POPULAR_CITIES.filter((c) => c.slug !== currentSlug);

  // If current city was in the list, fill from fallback
  while (cities.length < 8) {
    const next = FALLBACK_CITIES.find(
      (f) => f.slug !== currentSlug && !cities.some((c) => c.slug === f.slug)
    );
    if (!next) break;
    cities.push(next);
  }

  return (
    <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden shadow-sm shadow-black/10">
      <h2 className="text-xl font-semibold text-white mb-2">Popular Cities Worldwide</h2>
      <p className="text-sm text-zinc-500 mb-6">Most searched air quality destinations</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cities.slice(0, 8).map((city) => (
          <Link
            key={city.slug}
            href={`/air-quality/${city.slug}`}
            className="group block p-4 rounded-xl border border-[#1e1e1e] bg-black cursor-pointer hover:bg-[#0e0e0e] hover:border-zinc-700 active:scale-[0.97] transition-all duration-200"
          >
            <p className="font-semibold text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
              {city.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
