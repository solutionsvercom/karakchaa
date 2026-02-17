import React, { useEffect } from "react";
import { Flex } from "@radix-ui/themes";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { fetchStockItems, fetchStockStats } from "../../features/StockmanagementSlice";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import { 
  RevenueTrendChart, 
  TopProductsChart,
  buildLast7DaysTrend,
  buildTopProducts,
  filterLastNDays 
} from "../../components/dynamicComponents/Charts";
import { mockSalesData, calculateTotals } from "../Sales/Sales";
import { LowStockAlert } from "../../components/dynamicComponents/Charts/LowStockAlert";
import { RecentSales } from "../../components/dynamicComponents/Charts/RecentSales";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux
  const { customers } = useSelector((state: RootState) => state.customer);
  const { items: stockItems, stats: stockStats } = useSelector(
    (state: RootState) => state.stock
  );

  // Fetch stock data on mount
  useEffect(() => {
    dispatch(fetchStockItems());
    dispatch(fetchStockStats());
  }, [dispatch]);

  // Sales calculations (still using mock data until you have SalesSlice)
  const last7DaysData = filterLastNDays(mockSalesData, 7);
  const revenueTrendData = buildLast7DaysTrend(mockSalesData);
  const topProductsData = buildTopProducts(last7DaysData, 3);
  const weeklySummary = calculateTotals(last7DaysData);
  const todayData = filterLastNDays(mockSalesData, 0);
  const todaySummary = calculateTotals(todayData);

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
        <RecentSales 
          sales={mockSalesData}
          limit={5}
        />
      </Flex>
    </Flex>
  );
}