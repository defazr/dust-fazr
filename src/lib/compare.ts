export interface ComparePair {
  slug: string;
  slugA: string;
  slugB: string;
  label: string;
}

export const COMPARE_PAIRS: ComparePair[] = [
  // Original 10
  { slug: "seoul-vs-tokyo-air-quality", slugA: "seoul-air-quality", slugB: "tokyo-air-quality", label: "Seoul vs Tokyo" },
  { slug: "seoul-vs-beijing-air-quality", slugA: "seoul-air-quality", slugB: "beijing-air-quality", label: "Seoul vs Beijing" },
  { slug: "tokyo-vs-beijing-air-quality", slugA: "tokyo-air-quality", slugB: "beijing-air-quality", label: "Tokyo vs Beijing" },
  { slug: "seoul-vs-new-york-air-quality", slugA: "seoul-air-quality", slugB: "new-york-air-quality", label: "Seoul vs New York" },
  { slug: "london-vs-paris-air-quality", slugA: "london-air-quality", slugB: "paris-air-quality", label: "London vs Paris" },
  { slug: "tokyo-vs-london-air-quality", slugA: "tokyo-air-quality", slugB: "london-air-quality", label: "Tokyo vs London" },
  { slug: "beijing-vs-delhi-air-quality", slugA: "beijing-air-quality", slugB: "delhi-air-quality", label: "Beijing vs Delhi" },
  { slug: "new-york-vs-london-air-quality", slugA: "new-york-air-quality", slugB: "london-air-quality", label: "New York vs London" },
  { slug: "bangkok-vs-jakarta-air-quality", slugA: "bangkok-air-quality", slugB: "jakarta-air-quality", label: "Bangkok vs Jakarta" },
  { slug: "sydney-vs-melbourne-air-quality", slugA: "sydney-air-quality", slugB: "melbourne-air-quality", label: "Sydney vs Melbourne" },
  // Expansion: 20 more high-traffic pairs
  { slug: "delhi-vs-mumbai-air-quality", slugA: "delhi-air-quality", slugB: "mumbai-air-quality", label: "Delhi vs Mumbai" },
  { slug: "seoul-vs-london-air-quality", slugA: "seoul-air-quality", slugB: "london-air-quality", label: "Seoul vs London" },
  { slug: "tokyo-vs-new-york-air-quality", slugA: "tokyo-air-quality", slugB: "new-york-air-quality", label: "Tokyo vs New York" },
  { slug: "beijing-vs-shanghai-air-quality", slugA: "beijing-air-quality", slugB: "shanghai-air-quality", label: "Beijing vs Shanghai" },
  { slug: "new-york-vs-los-angeles-air-quality", slugA: "new-york-air-quality", slugB: "los-angeles-air-quality", label: "New York vs Los Angeles" },
  { slug: "paris-vs-berlin-air-quality", slugA: "paris-air-quality", slugB: "berlin-air-quality", label: "Paris vs Berlin" },
  { slug: "seoul-vs-osaka-air-quality", slugA: "seoul-air-quality", slugB: "osaka-air-quality", label: "Seoul vs Osaka" },
  { slug: "tokyo-vs-osaka-air-quality", slugA: "tokyo-air-quality", slugB: "osaka-air-quality", label: "Tokyo vs Osaka" },
  { slug: "bangkok-vs-ho-chi-minh-city-air-quality", slugA: "bangkok-air-quality", slugB: "ho-chi-minh-city-air-quality", label: "Bangkok vs Ho Chi Minh City" },
  { slug: "singapore-vs-kuala-lumpur-air-quality", slugA: "singapore-air-quality", slugB: "kuala-lumpur-air-quality", label: "Singapore vs Kuala Lumpur" },
  { slug: "dubai-vs-riyadh-air-quality", slugA: "dubai-air-quality", slugB: "riyadh-air-quality", label: "Dubai vs Riyadh" },
  { slug: "cairo-vs-istanbul-air-quality", slugA: "cairo-air-quality", slugB: "istanbul-air-quality", label: "Cairo vs Istanbul" },
  { slug: "london-vs-berlin-air-quality", slugA: "london-air-quality", slugB: "berlin-air-quality", label: "London vs Berlin" },
  { slug: "beijing-vs-new-york-air-quality", slugA: "beijing-air-quality", slugB: "new-york-air-quality", label: "Beijing vs New York" },
  { slug: "seoul-vs-busan-air-quality", slugA: "seoul-air-quality", slugB: "busan-air-quality", label: "Seoul vs Busan" },
  { slug: "mumbai-vs-bangalore-air-quality", slugA: "mumbai-air-quality", slugB: "bangalore-air-quality", label: "Mumbai vs Bangalore" },
  { slug: "shanghai-vs-hong-kong-air-quality", slugA: "shanghai-air-quality", slugB: "hong-kong-air-quality", label: "Shanghai vs Hong Kong" },
  { slug: "los-angeles-vs-san-francisco-air-quality", slugA: "los-angeles-air-quality", slugB: "san-francisco-air-quality", label: "Los Angeles vs San Francisco" },
  { slug: "tokyo-vs-seoul-air-quality", slugA: "tokyo-air-quality", slugB: "seoul-air-quality", label: "Tokyo vs Seoul" },
  { slug: "delhi-vs-beijing-air-quality", slugA: "delhi-air-quality", slugB: "beijing-air-quality", label: "Delhi vs Beijing" },
];

export function parseCompareSlug(slug: string): { slugA: string; slugB: string } | null {
  // Try known pairs first
  const known = COMPARE_PAIRS.find((p) => p.slug === slug);
  if (known) return { slugA: known.slugA, slugB: known.slugB };

  // Dynamic parsing: "cityA-vs-cityB-air-quality"
  const match = slug.match(/^(.+)-vs-(.+)-air-quality$/);
  if (!match) return null;

  return {
    slugA: `${match[1]}-air-quality`,
    slugB: `${match[2]}-air-quality`,
  };
}

export function getRelatedComparisons(currentSlug: string): ComparePair[] {
  return COMPARE_PAIRS.filter((p) => p.slug !== currentSlug);
}

export function makeCompareSlug(citySlugA: string, citySlugB: string): string {
  const a = citySlugA.replace("-air-quality", "");
  const b = citySlugB.replace("-air-quality", "");
  return `${a}-vs-${b}-air-quality`;
}
