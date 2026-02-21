import React, { useEffect } from "react";
import { Flex } from "@radix-ui/themes";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";

import { fetchStockItems, fetchStockStats } from "../../features/StockmanagementSlice";
import { fetchSales, Sale } from "../../features/SalesSlice";

import { SummaryCard } from "../../components/dynamicComponents/Cards";
import {
  RevenueTrendChart,
  TopProductsChart,
  buildLast7DaysTrend,
  buildTopProducts,
  filterLastNDays,
} from "../../components/dynamicComponents/Charts";

import { LowStockAlert } from "../../components/dynamicComponents/Charts/LowStockAlert";
import { RecentSales } from "../../components/dynamicComponents/Charts/RecentSales";

/* ================= HELPERS ================= */

const calculateTotals = (data: any[]) => {
  const totalRevenue = data.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = data.length;
  const averageOrder =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return { totalRevenue, totalOrders, averageOrder };
};

/* ================= COMPONENT ================= */

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();

  const { customers } = useSelector((state: RootState) => state.customer);
  const { items: stockItems, stats: stockStats } = useSelector(
    (state: RootState) => state.stock
  );

  const { sales } = useSelector((state: RootState) => state.sales);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    dispatch(fetchStockItems());
    dispatch(fetchStockStats());
    dispatch(fetchSales()); // ⭐ NEW REAL SALES DATA
  }, [dispatch]);

  /* ================= MAP SALES FOR CHARTS ================= */

  const dashboardSales = sales.map((s: Sale, index: number) => ({
    id: index,
    invoice: s.invoiceNumber,
    customer: s.product?.name || "Walk-in",
    items: s.product?.name || "-",
    type: s.paymentMethod,
    amount: s.totalAmount,
    payment: s.paymentStatus,
    dateTime: s.createdAt,
  }));

  /* ================= CALCULATIONS ================= */

  const last7DaysData = filterLastNDays(dashboardSales, 7);
  const revenueTrendData = buildLast7DaysTrend(dashboardSales);
  const topProductsData = buildTopProducts(last7DaysData, 3);

  const weeklySummary = calculateTotals(last7DaysData);

  const todayData = filterLastNDays(dashboardSales, 0);
  const todaySummary = calculateTotals(todayData);

  /* ================= UI ================= */

  return (
    <Flex direction="column" gap="5" width="100%">
      {/* ===== SUMMARY CARDS ===== */}
      <div className="kb-summary-row">
        <SummaryCard
          title="Today's Revenue"
          value={`₹${todaySummary.totalRevenue.toLocaleString()}`}
          accentColor="#00C853"
          softColor="#E5F9EE"
          icon="₹"
        />

        <SummaryCard
          title="Weekly Revenue"
          value={`₹${weeklySummary.totalRevenue.toLocaleString()}`}
          accentColor="#7C4DFF"
          softColor="#F0E9FF"
          icon="📊"
        />

        <SummaryCard
          title="Total Products"
          value={String(stockStats?.totalProducts || 0)}
          accentColor="#FF9100"
          softColor="#FFF3E0"
          icon="📦"
        />

        <SummaryCard
          title="Total Customers"
          value={String(customers.length)}
          accentColor="#2962FF"
          softColor="#E3F2FD"
          icon="👥"
        />
      </div>

      {/* ===== CHARTS ROW 1 ===== */}
      <Flex gap="4" width="100%">
        <RevenueTrendChart
          data={revenueTrendData}
          title="Sales Trend (Last 7 Days)"
          height={300}
        />
        <LowStockAlert products={stockItems} />
      </Flex>

      {/* ===== CHARTS ROW 2 ===== */}
      <Flex gap="4" width="100%">
        <TopProductsChart
          data={topProductsData}
          title="Top Selling Products"
          height={300}
          maxProducts={3}
          barSize={50}
        />
        <RecentSales sales={dashboardSales} limit={5} />
      </Flex>
    </Flex>
  );
}
