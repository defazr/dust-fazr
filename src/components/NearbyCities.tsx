import Link from "next/link";
import type { City } from "@/lib/types";

interface Props {
  cities: City[];
  currentCity: string;
}

export function NearbyCities({ cities, currentCity }: Props) {
  if (cities.length === 0) return null;

  return (
    <section className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 overflow-hidden shadow-sm shadow-black/10">
      <h2 className="text-xl font-semibold text-white mb-2">Compare Air Quality Near {currentCity}</h2>
      <p className="text-sm text-zinc-500 mb-6">Check pollution levels in nearby cities</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cities.map((city) => (
          <Link
            key={city.id}
            href={`/air-quality/${city.slug}`}
            className="group block p-4 rounded-xl border border-[#1e1e1e] bg-black cursor-pointer hover:bg-[#0e0e0e] hover:border-zinc-700 active:scale-[0.97] transition-all duration-200"
          >
            <p className="font-semibold text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
              {city.name}
            </p>
            <p className="text-xs text-zinc-700 mt-1">{city.country}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
