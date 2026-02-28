import React, { useEffect } from "react";
import { Flex } from "@radix-ui/themes";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";

import { fetchStockItems, fetchStockStats } from "../../features/StockmanagementSlice";
import { fetchSales, Sale } from "../../features/SalesSlice";
import { fetchCustomers } from "../../features/CustomersSlice";
import { fetchProducts } from "../../features/ProductsSlice";
import { fetchExpenses } from "../../features/ExpensesSlice";

import { SummaryCard } from "../../components/dynamicComponents/Cards";
import {
  RevenueTrendChart,
  TopProductsChart,
} from "../../components/dynamicComponents/Charts";

import {
  IndianRupee,
  TrendingUp,
  BarChart3,
  Package,
  Users,
} from "lucide-react";

import { LowStockAlert } from "../../components/dynamicComponents/Charts/LowStockAlert";
import { RecentSales } from "../../components/dynamicComponents/Charts/RecentSales";

/* ================= TYPES ================= */

interface DailySalesData {
  date: string;
  revenue: number;
  count: number;
}

interface ProductSalesCount {
  name: string;
  count: number;
}

/* ================= HELPER FUNCTIONS ================= */

/**
 * Get sales from last N days
 */
const getLastNDaysSales = (sales: Sale[], days: number): Sale[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= cutoffDate;
  });
};

/**
 * Get today's sales
 */
const getTodaysSales = (sales: Sale[]): Sale[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === today.getTime();
  });
};

/**
 * Build revenue trend data for last 7 days
 */
const buildRevenueTrendData = (sales: Sale[]): DailySalesData[] => {
  const last7Days = getLastNDaysSales(sales, 7);
  
  // Group sales by date
  const salesByDate = new Map<string, { revenue: number; count: number }>();

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
    salesByDate.set(dateStr, { revenue: 0, count: 0 });
  }

  // Aggregate sales data
  last7Days.forEach((sale) => {
    const saleDate = new Date(sale.createdAt);
    const dateStr = saleDate.toLocaleDateString("en-US", { weekday: "short" });
    
    const existing = salesByDate.get(dateStr);
    if (existing) {
      existing.revenue += sale.totalAmount;
      existing.count += 1;
    }
  });

  // Convert to array format for chart
  return Array.from(salesByDate.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    count: data.count,
  }));
};

/**
 * Build top selling products data
 */
const buildTopProductsData = (sales: Sale[], topN: number = 3): ProductSalesCount[] => {
  const last7Days = getLastNDaysSales(sales, 7);
  
  // Count sales by product
  const productCounts = new Map<string, number>();

  last7Days.forEach((sale) => {
    // Handle both single product and items array
    if (sale.product?.name) {
      const currentCount = productCounts.get(sale.product.name) || 0;
      productCounts.set(sale.product.name, currentCount + sale.quantity);
    } else if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach((item) => {
        const currentCount = productCounts.get(item.name) || 0;
        productCounts.set(item.name, currentCount + item.quantity);
      });
    }
  });

  // Convert to array and sort by count
  return Array.from(productCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
};

/**
 * Calculate totals from sales
 */
const calculateTotals = (sales: Sale[]) => {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalOrders = sales.length;
  const averageOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  return { totalRevenue, totalOrders, averageOrder };
};

/**
 * Get today's new customers
 */
const getTodaysCustomersCount = (customers: any[]): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return customers.filter((customer) => {
    const customerDate = new Date(customer.createdAt);
    customerDate.setHours(0, 0, 0, 0);
    return customerDate.getTime() === today.getTime();
  }).length;
};

/* ================= COMPONENT ================= */

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const { customers } = useSelector((state: RootState) => state.customer);
  const { products } = useSelector((state: RootState) => state.product);
  const { items: stockItems } = useSelector((state: RootState) => state.stock);
  const { sales } = useSelector((state: RootState) => state.sales);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    dispatch(fetchStockItems());
    dispatch(fetchStockStats());
    dispatch(fetchSales({ page: 1, limit: 100000 }));
    dispatch(fetchCustomers());
    dispatch(fetchProducts());
    dispatch(fetchExpenses());
  }, [dispatch]);

  /* ================= PROCESS DATA ================= */

  // Today's data
  const todaysSales = getTodaysSales(sales);
  const todaysSummary = calculateTotals(todaysSales);
  const todaysCustomers = getTodaysCustomersCount(customers);

  // Weekly data
  const weeklySales = getLastNDaysSales(sales, 7);
  const weeklySummary = calculateTotals(weeklySales);

  // Chart data
  const revenueTrendData = buildRevenueTrendData(sales);
  const topProductsData = buildTopProductsData(sales, 3);

  // Active products count
  const activeProductsCount = products.filter((p) => p.isActive).length;

  /* ================= UI ================= */

  return (
    <>
      <style>{`
        .dash-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 4px;
        }

        .dash-charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          width: 100%;
        }

        @media (max-width: 1023px) {
          .dash-summary-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .dash-charts-row {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }

        @media (max-width: 767px) {
          .dash-summary-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 0;
          }
          .dash-charts-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .kb-summary-card {
            padding: 12px 14px !important;
            border-radius: 14px !important;
          }
          .kb-summary-card-value {
            font-size: 18px !important;
            margin-top: 4px !important;
          }
          .kb-summary-card-icon-wrapper {
            width: 44px !important;
            height: 44px !important;
          }
          .kb-summary-card-icon-circle {
            width: 30px !important;
            height: 30px !important;
          }
        }

        @media (max-width: 400px) {
          .dash-summary-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .kb-summary-card-title {
            font-size: 11px !important;
          }
          .kb-summary-card-value {
            font-size: 16px !important;
          }
        }
      `}</style>

      <Flex direction="column" gap="4" width="100%">
        {/* ===== SUMMARY CARDS ===== */}
        <div className="dash-summary-grid">
          <SummaryCard
            title="Today's Revenue"
            value={`₹${todaysSummary.totalRevenue.toLocaleString()}`}
            accentColor="#00C853"
            softColor="#E5F9EE"
            icon={<IndianRupee size={22} strokeWidth={2.2} /> as any}
          />

          <SummaryCard
            title="Weekly Revenue"
            value={`₹${weeklySummary.totalRevenue.toLocaleString()}`}
            accentColor="#7C4DFF"
            softColor="#F0E9FF"
            icon={<BarChart3 size={22} strokeWidth={2.2} /> as any}
          />

          <SummaryCard
            title="Active Products"
            value={String(activeProductsCount)}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon={<Package size={22} strokeWidth={2.2} /> as any}
          />

          <SummaryCard
            title="Today's Customers"
            value={String(todaysCustomers)}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon={<Users size={22} strokeWidth={2.2} /> as any}
          />
        </div>

        {/* ===== CHARTS ROW 1 ===== */}
        <div className="dash-charts-row">
          <RevenueTrendChart
            data={revenueTrendData}
            title="Sales Trend (Last 7 Days)"
            height={300}
          />
          <LowStockAlert products={stockItems} />
        </div>

        {/* ===== CHARTS ROW 2 ===== */}
        <div className="dash-charts-row">
          <TopProductsChart
            data={topProductsData}
            title="Top Selling Products"
            height={300}
            maxProducts={3}
            barSize={50}
          />
          <RecentSales sales={sales} limit={5} />
        </div>
      </Flex>
    </>
  );
}