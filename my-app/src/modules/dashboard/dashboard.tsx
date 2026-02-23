import React, { useEffect } from "react";
import { Flex } from "@radix-ui/themes";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";

import { fetchStockItems, fetchStockStats } from "../../features/StockmanagementSlice";
import { fetchSales, Sale } from "../../features/SalesSlice";
import { fetchCustomers } from "../../features/CustomersSlice";
import { fetchProducts } from "../../features/ProductsSlice";

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
  const { products } = useSelector((state: RootState) => state.product);
  const { items: stockItems, stats: stockStats } = useSelector(
    (state: RootState) => state.stock
  );
  const { sales } = useSelector((state: RootState) => state.sales);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    dispatch(fetchStockItems());
    dispatch(fetchStockStats());
    dispatch(fetchSales());
    dispatch(fetchCustomers());
    dispatch(fetchProducts());
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

  const activeProductsCount = products.filter((p) => p.isActive).length;

  const now = new Date();
  const todayCustomers = customers.filter((c) => {
    const d = new Date(c.createdAt);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

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
            title="Active Products"
            value={String(activeProductsCount)}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon="📦"
          />
          <SummaryCard
            title="Today's Customers"
            value={String(todayCustomers)}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon="👥"
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
          <RecentSales sales={dashboardSales} limit={5} />
        </div>
      </Flex>
    </>
  );
}