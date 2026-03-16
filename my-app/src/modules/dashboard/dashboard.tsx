import React, { useEffect } from "react";
import { Flex } from "@radix-ui/themes";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";

import { fetchStockItems, fetchStockStats } from "../../features/StockmanagementSlice";
import { fetchSales } from "../../features/SalesSlice";
import { fetchCustomers } from "../../features/CustomersSlice";
import { fetchProducts } from "../../features/ProductsSlice";
import { fetchExpenses } from "../../features/ExpensesSlice";

import { SummaryCard } from "../../components/dynamicComponents/Cards";
import {
  RevenueTrendChart,
  TopProductsChart,
  buildRevenueTrendSmart,
  buildTopProducts,
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
import {
  calculateSalesTotals,
  getLastNDaysSales,
  getReportableSales,
  getTodaysSales,
  mapSalesToAnalytics,
} from "../../utils/salesAnalytics";

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

/*  COMPONENT  */

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const { customers } = useSelector((state: RootState) => state.customer);
  const { products } = useSelector((state: RootState) => state.product);
  const { items: stockItems } = useSelector((state: RootState) => state.stock);
  const { sales } = useSelector((state: RootState) => state.sales);

  /*  FETCH DATA  */

  useEffect(() => {
    dispatch(fetchStockItems());
    dispatch(fetchStockStats());
    dispatch(fetchSales({ page: 1, limit: 100000 }));
    dispatch(fetchCustomers({ page: 1, limit: 100000 }));
    dispatch(fetchProducts());
    dispatch(fetchExpenses());
  }, [dispatch]);

  /*  PROCESS DATA  */

  const reportableSales = getReportableSales(sales);

  // Today's data
  const todaysSales = getTodaysSales(reportableSales);
  const todaysSummary = calculateSalesTotals(todaysSales);
  const todaysCustomers = getTodaysCustomersCount(customers);

  // Weekly data
  const weeklySales = getLastNDaysSales(reportableSales, 7);
  const weeklySummary = calculateSalesTotals(weeklySales);
  const weeklyAnalyticsSales = mapSalesToAnalytics(weeklySales);

  // Chart data
  const revenueTrendData = buildRevenueTrendSmart(weeklyAnalyticsSales, "Last 7 Days");
  const topProductsData = buildTopProducts(weeklyAnalyticsSales, 3);

  // Active products count
  const activeProductsCount = products.filter((p) => p.isActive).length;

  /*  UI  */

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
        {/*  SUMMARY CARDS */}
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

        {/*  CHARTS ROW 1  */}
        <div className="dash-charts-row">
          <div className="dash-chart-card">
            <RevenueTrendChart
              data={revenueTrendData}
              title="Sales Trend (Last 7 Days)"
              height={280}
            />
          </div>
          <div className="dash-chart-card">
            <LowStockAlert products={stockItems} />
          </div>
        </div>

        {/* CHARTS ROW 2 */}
        <div className="dash-charts-row">
          <div className="dash-chart-card">
            <TopProductsChart
              data={topProductsData}
              title="Top Selling Products"
              height={280}
              maxProducts={3}
              barSize={50}
            />
          </div>
          <div className="dash-chart-card" style={{ overflowX: "auto" }}>
            <RecentSales sales={reportableSales} limit={5} />
          </div>
        </div>
      </Flex>
    </>
  );
}