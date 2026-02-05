import React from "react";
import { Flex } from "@radix-ui/themes";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import Table, { Column } from "../../components/dynamicComponents/Table";
import { 
  RevenueTrendChart, 
  TopProductsChart,
 buildLast7DaysTrend,
  buildTopProducts,
  filterLastNDays } from "../../components/dynamicComponents/Charts";
import { mockSalesData,calculateTotals } from "../Sales/Sales";
import { LowStockAlert } from "../../components/dynamicComponents/Charts/LowStockAlert";
import { RecentSales } from "../../components/dynamicComponents/Charts/RecentSales";
import { mockStockData, getStockStats } from "../Stockmanagement/Stockmanagement";
import { customers } from "../Customers/Customers";



export default function Dashboard() {
  // You can use different date ranges or all data
   const navigate = useNavigate();
    const location = useLocation();
     const [search, setSearch] = React.useState("")
  const last7DaysData = filterLastNDays(mockSalesData, 7);
  
  const revenueTrendData = buildLast7DaysTrend(mockSalesData);
  const topProductsData = buildTopProducts(last7DaysData, 3);
const salesSummary = calculateTotals(last7DaysData);
const weeklySummary = calculateTotals(last7DaysData); 
  const todayData = filterLastNDays(mockSalesData, 0);
  const todaySummary = calculateTotals(todayData);
  const stockStats = getStockStats(mockStockData);

  return (
    <Flex direction="column" gap="5" width="100%">

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
          value={String(stockStats.totalProducts)}
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

      <Flex gap="4" width="100%">
        <RevenueTrendChart 
          data={revenueTrendData}
          title="Sales Trend (Last 7 Days)"
          height={300}
        />
        <LowStockAlert products={mockStockData} />
      </Flex>

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