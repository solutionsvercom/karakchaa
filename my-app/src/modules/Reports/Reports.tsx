import React from "react";
import { Flex, Button, Text, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";
import { useDataFilter } from "../../hooks/useDataFilter";
import { mockSalesData, calculateTotals } from "../Sales/Sales";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/Store";
import { fetchExpenseTotals, fetchExpenses } from "../../features/ExpensesSlice";
import {
  RevenueTrendChart,
  TopProductsChart,
  buildRevenueTrendSmart,
  buildTopProducts,
} from "../../components/dynamicComponents/Charts";
import { SummaryCard } from "../../components/dynamicComponents/Cards";

export default function Reports() {
  const dispatch = useDispatch<AppDispatch>();

  const { category, setCategory, filteredData } =
    useDataFilter(mockSalesData);

  const salesSummary = calculateTotals(filteredData);

  React.useEffect(() => {
    dispatch(fetchExpenseTotals());
    dispatch(fetchExpenses()); // ✅ needed for breakdown
  }, [dispatch]);

  const { totals, expenses } = useSelector(
    (state: RootState) => state.expenses
  );

  const totalExpenses = totals?.totalExpenses ?? 0;

  const netProfit =
    (salesSummary?.totalRevenue || 0) - totalExpenses;

  // ✅ Calculate category breakdown dynamically
  const categoryTotals = (expenses || []).reduce((acc: any, expense: any) => {
    const key = expense.category;
    acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  const revenueTrendData = buildRevenueTrendSmart(
    filteredData,
    category
  );

  const topProductsData = buildTopProducts(filteredData);

  return (
    <Flex direction="column" gap="5" width="100%">
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
              <DropdownMenu.Item
                key={item}
                onClick={() => setCategory(item)}
              >
                {item}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      <div className="kb-summary-row">
        <SummaryCard
          title="Total Revenue"
          value={`₹${(salesSummary?.totalRevenue || 0).toLocaleString()}`}
          accentColor="#7C4DFF"
          softColor="#F0E9FF"
          icon="₹"
        />
        <SummaryCard
          title="Total Orders"
          value={String(salesSummary?.totalOrders || 0)}
          accentColor="#00C853"
          softColor="#E5F9EE"
          icon="🛒"
        />
        <SummaryCard
          title="Total Expenses"
          value={`₹${totalExpenses.toLocaleString()}`}
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

      <Flex gap="4" width="100%">
        <RevenueTrendChart data={revenueTrendData} />
        <TopProductsChart data={topProductsData} />
      </Flex>

      <Text size="4" weight="bold">
        Expense Breakdown
      </Text>

      <div className="kb-summary-row">
        <SummaryCard title="Inventory" value={`₹${categoryTotals.inventory ?? 0}`} accentColor="" softColor="" icon="" />
        <SummaryCard title="Supplies" value={`₹${categoryTotals.supplies ?? 0}`} accentColor="" softColor="" icon="" />
        <SummaryCard title="Salary" value={`₹${categoryTotals.salary ?? 0}`} accentColor="" softColor="" icon="" />
        <SummaryCard title="Utilities" value={`₹${categoryTotals.utilities ?? 0}`} accentColor="" softColor="" icon="" />
        <SummaryCard title="Rent" value={`₹${categoryTotals.rent ?? 0}`} accentColor="" softColor="" icon="" />
        <SummaryCard title="Maintenance" value={`₹${categoryTotals.maintenance ?? 0}`} accentColor="" softColor="" icon="" />
        <SummaryCard title="Others" value={`₹${categoryTotals.misc ?? 0}`} accentColor="" softColor="" icon="" />
      </div>
    </Flex>
  );
}
