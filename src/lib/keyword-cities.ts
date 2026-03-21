// Priority cities for keyword-driven pages
// city: simple slug used in URLs
// dbSlug: full slug used in DB lookup
export const KEYWORD_CITIES = [
  { city: "seoul", dbSlug: "seoul-air-quality", name: "Seoul" },
  { city: "tokyo", dbSlug: "tokyo-air-quality", name: "Tokyo" },
  { city: "beijing", dbSlug: "beijing-air-quality", name: "Beijing" },
  { city: "new-york", dbSlug: "new-york-air-quality", name: "New York" },
  { city: "london", dbSlug: "london-air-quality", name: "London" },
] as const;

export function findKeywordCity(citySlug: string) {
  return KEYWORD_CITIES.find((c) => c.city === citySlug) ?? null;
}
