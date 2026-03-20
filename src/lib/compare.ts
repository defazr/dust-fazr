export interface ComparePair {
  slug: string;
  slugA: string;
  slugB: string;
  label: string;
}

export const COMPARE_PAIRS: ComparePair[] = [
  {
    slug: "seoul-vs-tokyo-air-quality",
    slugA: "seoul-air-quality",
    slugB: "tokyo-air-quality",
    label: "Seoul vs Tokyo",
  },
  {
    slug: "seoul-vs-beijing-air-quality",
    slugA: "seoul-air-quality",
    slugB: "beijing-air-quality",
    label: "Seoul vs Beijing",
  },
  {
    slug: "tokyo-vs-beijing-air-quality",
    slugA: "tokyo-air-quality",
    slugB: "beijing-air-quality",
    label: "Tokyo vs Beijing",
  },
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
