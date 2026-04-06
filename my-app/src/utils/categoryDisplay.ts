/** Consistent badge color for any category slug (no hardcoded map). */
export function badgeColorForCategorySlug(slug: string): 
  | "amber"
  | "pink"
  | "blue"
  | "green"
  | "gray"
  | "orange"
  | "cyan"
  | "purple"
  | "red"
  | "yellow" {
  const palette = [
    "amber",
    "pink",
    "blue",
    "green",
    "orange",
    "gray",
    "cyan",
    "purple",
    "red",
    "yellow",
  ] as const;
  let h = 0;
  const s = slug || "other";
  for (let i = 0; i < s.length; i++) {
    h = (h + s.charCodeAt(i) * (i + 1)) % palette.length;
  }
  return palette[h];
}

export function formatCategorySlugAsLabel(slug: string) {
  return String(slug || "other")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function categoryLabelForSlug(
  slug: string,
  categories: { slug: string; label: string }[]
) {
  const c = categories.find((x) => x.slug === slug);
  return c?.label ?? formatCategorySlugAsLabel(slug);
}
