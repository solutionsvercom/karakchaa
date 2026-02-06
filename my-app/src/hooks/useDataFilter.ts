// src/hooks/useDataFilter.ts
import { useState } from "react";

/**
 * Comprehensive date parser that handles multiple date formats
 */
function parseDateTime(dateTime: string): Date {
  // Handle null, undefined, or empty strings
  if (!dateTime) {
    console.warn("Empty date provided, using current date");
    return new Date();
  }

  // 1. ISO 8601 Format (e.g., "2024-01-15T10:30:00Z" or "2024-01-15T10:30:00+05:30")
  if (!isNaN(Date.parse(dateTime))) {
    return new Date(dateTime);
  }

  // 2. YYYY-MM-DD HH:mm:ss (e.g., "2024-01-15 10:30:45")
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTime)) {
    return new Date(dateTime.replace(" ", "T"));
  }

  // 3. YYYY-MM-DD (e.g., "2024-01-15")
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateTime)) {
    return new Date(dateTime);
  }

  // 4. DD/MM/YYYY HH:mm:ss (e.g., "15/01/2024 10:30:45")
  if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(dateTime)) {
    const [datePart, timePart] = dateTime.split(" ");
    const [day, month, year] = datePart.split("/");
    return new Date(`${year}-${month}-${day}T${timePart}`);
  }

  // 5. DD/MM/YYYY (e.g., "15/01/2024")
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateTime)) {
    const [day, month, year] = dateTime.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  // 6. MM/DD/YYYY (US Format) (e.g., "01/15/2024")
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateTime)) {
    const [month, day, year] = dateTime.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  // 7. DD-MM-YYYY (e.g., "15-01-2024")
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateTime)) {
    const [day, month, year] = dateTime.split("-");
    return new Date(`${year}-${month}-${day}`);
  }

  // 8. MM-DD-YYYY (US Format with dashes) (e.g., "01-15-2024")
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateTime)) {
    const [month, day, year] = dateTime.split("-");
    return new Date(`${year}-${month}-${day}`);
  }

  // 9. DD.MM.YYYY (European format) (e.g., "15.01.2024")
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateTime)) {
    const [day, month, year] = dateTime.split(".");
    return new Date(`${year}-${month}-${day}`);
  }

  // 10. YYYY/MM/DD (e.g., "2024/01/15")
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateTime)) {
    const [year, month, day] = dateTime.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  // 11. YYYYMMDD (Compact format) (e.g., "20240115")
  if (/^\d{8}$/.test(dateTime)) {
    const year = dateTime.substring(0, 4);
    const month = dateTime.substring(4, 6);
    const day = dateTime.substring(6, 8);
    return new Date(`${year}-${month}-${day}`);
  }

  // 12. Unix Timestamp in milliseconds (e.g., "1705305000000")
  if (/^\d{13}$/.test(dateTime)) {
    return new Date(parseInt(dateTime, 10));
  }

  // 13. Unix Timestamp in seconds (e.g., "1705305000")
  if (/^\d{10}$/.test(dateTime)) {
    return new Date(parseInt(dateTime, 10) * 1000);
  }

  // 14. Relative dates (e.g., "today", "yesterday", "tomorrow")
  const lowerDateTime = dateTime.toLowerCase().trim();
  const now = new Date();
  
  if (lowerDateTime === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  
  if (lowerDateTime === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  }
  
  if (lowerDateTime === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  }

  // 15. Month/Year format (e.g., "Jan 2024", "January 2024")
  const monthYearMatch = dateTime.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];
    const monthNamesShort = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"
    ];
    
    const monthName = monthYearMatch[1].toLowerCase();
    const year = monthYearMatch[2];
    
    let monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) {
      monthIndex = monthNamesShort.indexOf(monthName);
    }
    
    if (monthIndex !== -1) {
      return new Date(parseInt(year), monthIndex, 1);
    }
  }

  // 16. Written date format (e.g., "15 January 2024", "January 15, 2024")
  const writtenDateMatch1 = dateTime.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
  if (writtenDateMatch1) {
    const day = writtenDateMatch1[1];
    const monthName = writtenDateMatch1[2].toLowerCase();
    const year = writtenDateMatch1[3];
    
    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];
    const monthNamesShort = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"
    ];
    
    let monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) {
      monthIndex = monthNamesShort.indexOf(monthName);
    }
    
    if (monthIndex !== -1) {
      return new Date(parseInt(year), monthIndex, parseInt(day));
    }
  }

  // 17. US written format (e.g., "January 15, 2024")
  const writtenDateMatch2 = dateTime.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (writtenDateMatch2) {
    const monthName = writtenDateMatch2[1].toLowerCase();
    const day = writtenDateMatch2[2];
    const year = writtenDateMatch2[3];
    
    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];
    const monthNamesShort = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"
    ];
    
    let monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) {
      monthIndex = monthNamesShort.indexOf(monthName);
    }
    
    if (monthIndex !== -1) {
      return new Date(parseInt(year), monthIndex, parseInt(day));
    }
  }

  // Fallback: Try native Date parsing (last resort)
  console.warn(`Unrecognized date format: "${dateTime}", attempting native parsing`);
  const fallbackDate = new Date(dateTime);
  
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  // If all else fails, return current date and log error
  console.error(`Unable to parse date: "${dateTime}", returning current date`);
  return new Date();
}

/**
 * Filter data by predefined date ranges
 */
function filterByDateRange<T extends { dateTime: string }>(
  data: T[],
  range: string
): T[] {
  if (range === "All Time") return data;

  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today

  const daysMap: Record<string, number> = {
    "Today": 0,
    "Yesterday": 1,
    "Last 1 Day": 1,
    "Last 7 Days": 7,
    "Last 14 Days": 14,
    "Last 30 Days": 30,
    "Last 1 Month": 30,
    "Last 1 Months": 30,
    "Last 3 Months": 90,
    "Last 6 Months": 180,
    "Last 1 Year": 365,
    "Last 2 Years": 730,
  };

  const days = daysMap[range];
  if (days === undefined) return data;

  const fromDate = new Date(now);
  
  if (days === 0) {
    // Today only
    fromDate.setHours(0, 0, 0, 0);
  } else if (days === 1 && range === "Yesterday") {
    // Yesterday only
    fromDate.setDate(now.getDate() - 1);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(fromDate);
    toDate.setHours(23, 59, 59, 999);
    
    return data.filter((item) => {
      const itemDate = parseDateTime(item.dateTime);
      return itemDate >= fromDate && itemDate <= toDate;
    });
  } else {
    // Last N days
    fromDate.setDate(now.getDate() - days);
    fromDate.setHours(0, 0, 0, 0);
  }

  return data.filter((item) => {
    const itemDate = parseDateTime(item.dateTime);
    return itemDate >= fromDate && itemDate <= now;
  });
}

/**
 * Filter data by custom date range
 */
function filterByCustomDateRange<T extends { dateTime: string }>(
  data: T[],
  startDate: Date | null,
  endDate: Date | null
): T[] {
  if (!startDate && !endDate) return data;

  return data.filter((item) => {
    const itemDate = parseDateTime(item.dateTime);

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      return itemDate >= start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return itemDate <= end;
    }

    return true;
  });
}

/**
 * Filter data by specific month and year
 */
function filterByMonth<T extends { dateTime: string }>(
  data: T[],
  month: number,
  year: number
): T[] {
  return data.filter((item) => {
    const itemDate = parseDateTime(item.dateTime);
    return itemDate.getMonth() === month && itemDate.getFullYear() === year;
  });
}

/**
 * Filter data by specific year
 */
function filterByYear<T extends { dateTime: string }>(
  data: T[],
  year: number
): T[] {
  return data.filter((item) => {
    const itemDate = parseDateTime(item.dateTime);
    return itemDate.getFullYear() === year;
  });
}

/**
 * Filter data by quarter
 */
function filterByQuarter<T extends { dateTime: string }>(
  data: T[],
  quarter: 1 | 2 | 3 | 4,
  year: number
): T[] {
  const quarterMonths: Record<number, [number, number, number]> = {
    1: [0, 1, 2],   // Jan, Feb, Mar
    2: [3, 4, 5],   // Apr, May, Jun
    3: [6, 7, 8],   // Jul, Aug, Sep
    4: [9, 10, 11], // Oct, Nov, Dec
  };

  const months = quarterMonths[quarter];

  return data.filter((item) => {
    const itemDate = parseDateTime(item.dateTime);
    return (
      months.includes(itemDate.getMonth()) &&
      itemDate.getFullYear() === year
    );
  });
}

/**
 * Custom hook for comprehensive data filtering
 */
export function useDataFilter<T extends { dateTime: string }>(data: T[]) {
  const [category, setCategory] = useState("All Time");
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Filter based on category or custom range
  const filteredData =
    category === "Custom Range"
      ? filterByCustomDateRange(data, customStartDate, customEndDate)
      : filterByDateRange(data, category);

  return {
    category,
    setCategory,
    filteredData,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
  };
}

// Export individual filter functions for advanced use cases
export {
  parseDateTime,
  filterByDateRange,
  filterByCustomDateRange,
  filterByMonth,
  filterByYear,
  filterByQuarter,
};