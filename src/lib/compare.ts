export interface ComparePair {
  slug: string;
  slugA: string;
  slugB: string;
  label: string;
}

export const COMPARE_PAIRS: ComparePair[] = [
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
