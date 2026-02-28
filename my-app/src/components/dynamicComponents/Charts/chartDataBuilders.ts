// src/components/charts/chartDataBuilders.ts

/**
 * Build revenue trend data for line chart
 * Groups sales by date and calculates total revenue per day
 */
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

/**
 * Build revenue trend data with custom date format
 */
export function buildRevenueTrendCustomFormat(
  data: { dateTime: string; amount: number }[],
  dateFormat: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
  }
) {
  const map: Record<string, number> = {};

  data.forEach((sale) => {
    const date = new Date(sale.dateTime).toLocaleDateString("en-IN", dateFormat);
    map[date] = (map[date] || 0) + sale.amount;
  });

  return Object.entries(map).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}



/**
 * Build top products by revenue (not just count)
 */
export function buildTopProductsByRevenue(
  data: { items: string; amount: number }[],
  limit: number = 5
) {
  const map: Record<string, number> = {};

  data.forEach((sale) => {
    map[sale.items] = (map[sale.items] || 0) + sale.amount;
  });

  return Object.entries(map)
    .map(([name, revenue]) => ({ name, count: revenue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Build category-wise sales data
 */
export function buildCategorySales(
  data: { category: string; amount: number }[]
) {
  const map: Record<string, number> = {};

  data.forEach((sale) => {
    map[sale.category] = (map[sale.category] || 0) + sale.amount;
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
}

/**
 * Build hourly sales distribution
 */
export function buildHourlySales(
  data: { dateTime: string; amount: number }[]
) {
  const map: Record<string, number> = {};

  data.forEach((sale) => {
    const hour = new Date(sale.dateTime).getHours();
    const hourLabel = `${hour.toString().padStart(2, "0")}:00`;
    map[hourLabel] = (map[hourLabel] || 0) + sale.amount;
  });

  // Fill in missing hours with 0
  const result: { hour: string; revenue: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const hourLabel = `${i.toString().padStart(2, "0")}:00`;
    result.push({
      hour: hourLabel,
      revenue: map[hourLabel] || 0,
    });
  }

  return result;
}

/**
 * Build day of week sales distribution
 */
export function buildDayOfWeekSales(
  data: { dateTime: string; amount: number }[]
) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map: Record<string, number> = {};

  data.forEach((sale) => {
    const dayIndex = new Date(sale.dateTime).getDay();
    const dayName = dayNames[dayIndex];
    map[dayName] = (map[dayName] || 0) + sale.amount;
  });

  // Ensure all days are present
  return dayNames.map((day) => ({
    day,
    revenue: map[day] || 0,
  }));
}

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowthRate(
  currentPeriodData: { amount: number }[],
  previousPeriodData: { amount: number }[]
): number {
  const currentTotal = currentPeriodData.reduce((sum, item) => sum + item.amount, 0);
  const previousTotal = previousPeriodData.reduce((sum, item) => sum + item.amount, 0);

  if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;

  return ((currentTotal - previousTotal) / previousTotal) * 100;
}

/**
 * Build comparison data for two periods
 */
export function buildPeriodComparison(
  currentData: { dateTime: string; amount: number }[],
  previousData: { dateTime: string; amount: number }[]
) {
  return {
    current: buildRevenueTrend(currentData),
    previous: buildRevenueTrend(previousData),
    growthRate: calculateGrowthRate(currentData, previousData),
  };
}
/**
 * Filter data for last N days
 */
export function filterLastNDays<T extends { dateTime: string }>(
  data: T[],
  days: number
): T[] {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - days);
  fromDate.setHours(0, 0, 0, 0);

  return data.filter((item) => {
    const itemDate = new Date(item.dateTime);
    return itemDate >= fromDate && itemDate <= now;
  });
}
/**
 * Build revenue trend by day of week (for last 7 days)
 * Returns data with day names (Mon, Tue, Wed, etc.) on X-axis
 */
export function buildRevenueTrendByDayName(
  data: { dateTime: string; amount: number }[]
) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map: Record<string, { revenue: number; date: Date }> = {};

  data.forEach((sale) => {
    const saleDate = new Date(sale.dateTime);
    const dayIndex = saleDate.getDay();
    const dayName = dayNames[dayIndex];

    if (!map[dayName]) {
      map[dayName] = { revenue: 0, date: saleDate };
    }
    map[dayName].revenue += sale.amount;
  });

  // Sort by actual date to maintain chronological order
  return Object.entries(map)
    .map(([day, data]) => ({
      date: day,
      revenue: data.revenue,
      sortDate: data.date,
    }))
    .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
    .map(({ date, revenue }) => ({ date, revenue }));
}
/**
 * Build revenue trend for last 7 days with day names
 * Shows all 7 days even if no sales (with 0 revenue)
 */
export function buildLast7DaysTrend(
  data: { dateTime: string; amount: number }[]
) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result: { date: string; revenue: number }[] = [];

  // Get today and go back 7 days
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);

    // Get day name
    const dayName = dayNames[targetDate.getDay()];

    // Calculate revenue for this day
    const dayRevenue = data
      .filter((sale) => {
        const saleDate = new Date(sale.dateTime);
        return saleDate >= targetDate && saleDate < nextDate;
      })
      .reduce((sum, sale) => sum + sale.amount, 0);

    result.push({
      date: dayName,
      revenue: dayRevenue,
    });
  }

  return result;
}
/**
 * Build revenue trend for last 7 days with "Mon 29" format
 */
export function buildLast7DaysTrendWithDate(
  data: { dateTime: string; amount: number }[]
) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result: { date: string; revenue: number }[] = [];

  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);

    // Format as "Mon 29" or just "Mon"
    const dayName = dayNames[targetDate.getDay()];
    const dayNumber = targetDate.getDate();
    const formattedDate = `${dayName} ${dayNumber}`;

    // Calculate revenue for this day
    const dayRevenue = data
      .filter((sale) => {
        const saleDate = new Date(sale.dateTime);
        return saleDate >= targetDate && saleDate < nextDate;
      })
      .reduce((sum, sale) => sum + sale.amount, 0);

    result.push({
      date: formattedDate,
      revenue: dayRevenue,
    });
  }

  return result;
}
// src/components/charts/chartDataBuilders.ts

/**
 * Smart Revenue Trend Builder - Adapts format based on date range
 */
// src/components/charts/chartDataBuilders.ts

/**
 * Smart Revenue Trend Builder - Adapts format based on date range
 */
export function buildRevenueTrendSmart(
  data: { dateTime: string; amount: number }[],
  dateRange: string
) {
  if (dateRange === "Today" || dateRange === "Yesterday") {
    return buildRevenueTrendByHour(data);
  } else if (dateRange === "Last 7 Days") {
    return buildLast7DaysFixed(data);
  } else if (dateRange === "Last 14 Days") {
    return buildLastNDaysFixed(data, 14);
  } else if (dateRange === "Last 30 Days") {
    return buildLastNDaysFixed(data, 30);
  } else if (dateRange === "Last 3 Months") {
    return buildLastNWeeksFixed(data, 13);
  } else if (dateRange === "Last 6 Months") {
    return buildLastNWeeksFixed(data, 26);
  } else if (dateRange === "Last 1 Year") {
    return buildLastNMonthsFixed(data, 12);
  } else {
    return buildAllTimeMonthly(data);
  }
}

function buildLast7DaysFixed(data: { dateTime: string; amount: number }[]) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const result: { date: string; revenue: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const target = new Date(today);
    target.setDate(today.getDate() - i);
    target.setHours(0, 0, 0, 0);
    const next = new Date(target);
    next.setDate(target.getDate() + 1);

    const revenue = data
      .filter((s) => { const d = new Date(s.dateTime); return d >= target && d < next; })
      .reduce((sum, s) => sum + s.amount, 0);

    result.push({ date: dayNames[target.getDay()], revenue });
  }
  return result;
}

function buildLastNDaysFixed(data: { dateTime: string; amount: number }[], days: number) {
  const today = new Date();
  const result: { date: string; revenue: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const target = new Date(today);
    target.setDate(today.getDate() - i);
    target.setHours(0, 0, 0, 0);
    const next = new Date(target);
    next.setDate(target.getDate() + 1);

    const label = target.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const revenue = data
      .filter((s) => { const d = new Date(s.dateTime); return d >= target && d < next; })
      .reduce((sum, s) => sum + s.amount, 0);

    result.push({ date: label, revenue });
  }
  return result;
}

function buildLastNWeeksFixed(data: { dateTime: string; amount: number }[], weeks: number) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const result: { date: string; revenue: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const label = weekStart.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const revenue = data
      .filter((s) => { const d = new Date(s.dateTime); return d >= weekStart && d < weekEnd; })
      .reduce((sum, s) => sum + s.amount, 0);

    result.push({ date: label, revenue });
  }
  return result;
}

function buildLastNMonthsFixed(data: { dateTime: string; amount: number }[], months: number) {
  const today = new Date();
  const result: { date: string; revenue: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);

    const label = monthStart.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    const revenue = data
      .filter((s) => { const d = new Date(s.dateTime); return d >= monthStart && d < monthEnd; })
      .reduce((sum, s) => sum + s.amount, 0);

    result.push({ date: label, revenue });
  }
  return result;
}

function buildAllTimeMonthly(data: { dateTime: string; amount: number }[]) {
  const today = new Date();
  const result: { date: string; revenue: number }[] = [];

  // Find earliest sale date, fallback to 12 months ago
  let start: Date;
  if (data.length > 0) {
    const sorted = [...data].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
    start = new Date(sorted[0].dateTime);
  } else {
    start = new Date(today);
    start.setMonth(today.getMonth() - 11);
  }

  // Always show at least 12 months
  const minStart = new Date(today);
  minStart.setMonth(today.getMonth() - 11);
  if (start > minStart) start = minStart;

  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  while (start <= today) {
    const monthStart = new Date(start);
    const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 1);

    const label = monthStart.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });

    const revenue = data
      .filter((s) => {
        const d = new Date(s.dateTime);
        return d >= monthStart && d < monthEnd;
      })
      .reduce((sum, s) => sum + s.amount, 0);

    result.push({ date: label, revenue });
    start.setMonth(start.getMonth() + 1);
  }

  return result;
}

/**
 * Build revenue trend by hour (for single day)
 */
export function buildRevenueTrendByHour(
  data: { dateTime: string; amount: number }[]
) {
  const map: Record<string, number> = {};

  data.forEach((sale) => {
    const saleDate = new Date(sale.dateTime);
    const hour = saleDate.getHours();
    const hourLabel = `${hour.toString().padStart(2, "0")}:00`;
    map[hourLabel] = (map[hourLabel] || 0) + sale.amount;
  });

  // Fill in missing hours with 0
  const result: { date: string; revenue: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const hourLabel = `${i.toString().padStart(2, "0")}:00`;
    result.push({
      date: hourLabel,
      revenue: map[hourLabel] || 0,
    });
  }

  return result;
}

/**
 * Build revenue trend by day (for weeks/months)
 * FIXED: Sorts chronologically by actual date
 */
export function buildRevenueTrendByDay(
  data: { dateTime: string; amount: number }[]
) {
  const map: Record<string, { revenue: number; date: Date }> = {};

  data.forEach((sale) => {
    const saleDate = new Date(sale.dateTime);
    const dateLabel = saleDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    if (!map[dateLabel]) {
      map[dateLabel] = { revenue: 0, date: saleDate };
    }
    map[dateLabel].revenue += sale.amount;
  });

  // Sort by actual date, not string
  return Object.entries(map)
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      sortDate: data.date,
    }))
    .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
    .map(({ date, revenue }) => ({ date, revenue }));
}

/**
 * Build revenue trend by week (for 3-6 months)
 * FIXED: Sorts chronologically
 */
export function buildRevenueTrendByWeek(
  data: { dateTime: string; amount: number }[]
) {
  const map: Record<string, { revenue: number; date: Date }> = {};

  data.forEach((sale) => {
    const saleDate = new Date(sale.dateTime);
    
    // Get the Monday of the week
    const dayOfWeek = saleDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(saleDate);
    monday.setDate(saleDate.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekLabel = monday.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    if (!map[weekLabel]) {
      map[weekLabel] = { revenue: 0, date: monday };
    }
    map[weekLabel].revenue += sale.amount;
  });

  // Sort by actual date
  return Object.entries(map)
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      sortDate: data.date,
    }))
    .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
    .map(({ date, revenue }) => ({ date, revenue }));
}

/**
 * Build revenue trend by month (for 1+ years)
 * Already sorting correctly
 */
export function buildRevenueTrendByMonth(
  data: { dateTime: string; amount: number }[]
) {
  const map: Record<string, { revenue: number; date: Date }> = {};

  data.forEach((sale) => {
    const saleDate = new Date(sale.dateTime);
    const monthLabel = saleDate.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });

    if (!map[monthLabel]) {
      map[monthLabel] = { revenue: 0, date: saleDate };
    }
    map[monthLabel].revenue += sale.amount;
  });

  return Object.entries(map)
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      sortDate: data.date,
    }))
    .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
    .map(({ date, revenue }) => ({ date, revenue }));
}

/**
 * Build top products
 */
export function buildTopProducts(
  data: { items: string }[],
  limit: number = 5
) {
  const map: Record<string, number> = {};

  data.forEach((sale) => {
    map[sale.items] = (map[sale.items] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ... rest of your functions