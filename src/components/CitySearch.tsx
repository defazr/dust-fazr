"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface City {
  name: string;
  slug: string;
  country: string;
}

interface Props {
  cities: City[];
}

export function CitySearch({ cities }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const filtered = query.length >= 1
    ? cities.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.country.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className={`relative rounded-2xl border transition-all duration-200 ${
        focused ? "border-zinc-600 shadow-lg shadow-black/30" : "border-[#1e1e1e]"
      }`}>
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered.length > 0) {
              e.preventDefault();
              router.push(`/air-quality/${filtered[0].slug}`);
            }
          }}
          placeholder="Search city (e.g. Seoul, Tokyo, New York)"
          className="w-full bg-[#121212] text-white placeholder-zinc-600 rounded-2xl py-4 pl-12 pr-4 text-base outline-none"
        />
      </div>

      {/* Dropdown results */}
      {focused && filtered.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#121212] border border-[#1e1e1e] rounded-2xl overflow-hidden shadow-xl shadow-black/40 z-50">
          {filtered.map((city) => (
            <button
              key={city.slug}
              type="button"
              aria-label={`View ${city.name} air quality`}
              onMouseDown={() => router.push(`/air-quality/${city.slug}`)}
              className="w-full text-left px-5 py-3 hover:bg-[#1a1a1a] transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-sm font-semibold text-white">{city.name}</span>
                <span className="text-xs text-zinc-600 ml-2">{city.country}</span>
              </div>
              <svg className="w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
