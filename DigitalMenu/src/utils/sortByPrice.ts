export type PriceSortOrder = "asc" | "desc";

export function sortByPrice<T>(
  items: T[],
  order: PriceSortOrder,
  getPrice: (item: T) => number
): T[] {
  const sorted = [...items].sort((a, b) => getPrice(a) - getPrice(b));
  return order === "desc" ? sorted.reverse() : sorted;
}
