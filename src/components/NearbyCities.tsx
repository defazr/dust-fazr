import Link from "next/link";
import type { City } from "@/lib/types";
import { makeCompareSlug } from "@/lib/compare";

interface Props {
  cities: City[];
  currentCity: string;
  currentSlug: string;
}

export function NearbyCities({ cities, currentCity, currentSlug }: Props) {
  if (cities.length === 0) return null;

  return (
    <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden shadow-sm shadow-black/10">
      <h2 className="text-xl font-semibold text-white mb-2">Compare Air Quality Near {currentCity}</h2>
      <p className="text-sm text-zinc-500 mb-6">Check pollution levels in nearby cities</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cities.map((city) => (
          <div key={city.id} className="space-y-2">
            <Link
              href={`/air-quality/${city.slug}`}
              className="group block p-4 rounded-xl border border-[#1e1e1e] bg-black cursor-pointer hover:bg-[#0e0e0e] hover:border-zinc-700 active:scale-[0.97] transition-all duration-200"
            >
              <p className="font-semibold text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
                {city.name}
              </p>
              <p className="text-xs text-zinc-700 mt-1">{city.country}</p>
            </Link>
            <Link
              href={`/compare/${makeCompareSlug(currentSlug, city.slug)}`}
              className="block text-center text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors py-1"
            >
              Compare {currentCity} vs {city.name} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
