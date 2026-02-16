import React, { useMemo } from "react";
import { Flex, Button, Text, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";
import { useDataFilter } from "../../hooks/useDataFilter";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import { Sale } from "../../features/SalesSlice";

import {
  RevenueTrendChart,
  TopProductsChart,
  buildRevenueTrendSmart,
  buildTopProducts,
} from "../../components/dynamicComponents/Charts";

import { SummaryCard } from "../../components/dynamicComponents/Cards";

import {
  ExpenseTransaction,
  calculateExpenseTotals,
  mockExpenses,
} from "../Expenses/Expenses";

/* ================= HELPER (REPLACES OLD EXPORT) ================= */

const calculateTotals = (data: any[]) => {
  const totalRevenue = data.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = data.length;
  const averageOrder =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return { totalRevenue, totalOrders, averageOrder };
};

/* ================= COMPONENT ================= */

export default function Reports() {
  /* ⭐ GET REAL SALES FROM REDUX */
  const { sales } = useSelector((state: RootState) => state.sales);

  /* ⭐ MAP SALES TO OLD CHART FORMAT */
  const dashboardSales = useMemo(
    () =>
      sales.map((s: Sale, index: number) => ({
        id: index,
        invoice: s.invoiceNumber,
        customer: s.product?.name || "Walk-in",
        items: s.product?.name || "-",
        type: s.paymentMethod,
        amount: s.totalAmount,
        payment: s.paymentStatus,
        dateTime: s.createdAt,
      })),
    [sales]
  );

  /* ⭐ KEEP YOUR EXISTING FILTER HOOK (UNCHANGED) */
  const { category, setCategory, filteredData } =
    useDataFilter(dashboardSales);

  const salesSummary = calculateTotals(filteredData);

  const {
    totalExpenses,
    thisMonthExpenses,
    totalTransactions,
    averageExpense,
  } = calculateExpenseTotals(mockExpenses);

  const netProfit = salesSummary.totalRevenue - totalExpenses;

  const revenueTrendData = buildRevenueTrendSmart(
    filteredData,
    category
  );
  const topProductsData = buildTopProducts(filteredData);

  return (
    <Flex direction="column" gap="5" width="100%">
      {/* ===== HEADER ===== */}
      <Flex justify="between" align="center">
        <Text size="8" weight="bold">
          Reports & Analytics
        </Text>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="outline">
              {category}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            {[
              "All Time",
              "Today",
              "Yesterday",
              "Last 7 Days",
              "Last 14 Days",
              "Last 30 Days",
              "Last 3 Months",
              "Last 6 Months",
              "Last 1 Year",
            ].map((item) => (
              <DropdownMenu.Item key={item} onClick={() => setCategory(item)}>
                {item}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="kb-summary-row">
        <SummaryCard
          title="Total Revenue"
          value={`₹${salesSummary.totalRevenue.toLocaleString()}`}
          accentColor="#7C4DFF"
          softColor="#F0E9FF"
          icon="₹"
        />

        <SummaryCard
          title="Total Orders"
          value={String(salesSummary.totalOrders)}
          accentColor="#00C853"
          softColor="#E5F9EE"
          icon="🛒"
        />

        <SummaryCard
          title="Total Expenses"
          value={String(totalExpenses)}
          accentColor="#FF9100"
          softColor="#FFF3E0"
          icon="💵"
        />

        <SummaryCard
          title="Net Profit"
          value={
            <span
              style={{
                color: netProfit >= 0 ? "#16A34A" : "#DC2626",
                fontWeight: 600,
              }}
            >
              {netProfit < 0 ? "-" : "+"}
              ₹{Math.abs(netProfit).toLocaleString()}
            </span>
          }
          accentColor="#2962FF"
          softColor="#E3F2FD"
          icon={netProfit >= 0 ? "📈" : "📉"}
        />
      </div>

      {/* ===== CHARTS ===== */}
      <Flex gap="4" width="100%">
        <RevenueTrendChart data={revenueTrendData} />
        <TopProductsChart data={topProductsData} />
      </Flex>

      {/* ===== EXPENSE BREAKDOWN ===== */}
      <Text size="4" weight="bold">
        Expense Breakdown
      </Text>

      <div className="kb-summary-row">
        {[
          "Inventory",
          "Supplies",
          "Salary",
          "Utilities",
          "Rent",
          "Maintenance",
          "Others",
        ].map((title) => (
          <SummaryCard
            key={title}
            title={title}
            value="₹0"
            accentColor="#ECEFF1"
            softColor="#F5F5F5"
            icon="💰"
          />
        ))}
      </div>
    </Flex>
  );
}
