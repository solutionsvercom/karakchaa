export function buildRevenueTrend(
  data: { dateTime: string; amount: number }[]
) {
  const map: Record<string, number> = {};

  data.forEach((sale) => {
    const date = new Date(sale.dateTime).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    map[date] = (map[date] || 0) + sale.amount;
  });

  return Object.entries(map).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

export function buildTopProducts(
  data: { items: string }[]
) {
  const map: Record<string, number> = {};

  data.forEach((sale) => {
    map[sale.items] = (map[sale.items] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}