import React, { useMemo, useEffect, useState } from "react";
import { Flex, Button, Text, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";
import { useDataFilter } from "../../hooks/useDataFilter";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/Store";
import { Sale, fetchSales } from "../../features/SalesSlice";
import {
  RevenueTrendChart,
  TopProductsChart,
  buildRevenueTrendSmart,
  buildTopProducts,
} from "../../components/dynamicComponents/Charts";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import { fetchExpenseTotals, fetchExpenses } from "../../features/ExpensesSlice";
import { fetchEmployees } from "../../features/EmployeesSlice";
import {
  IndianRupee,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Package,
  ShoppingCart,
  BriefcaseBusiness,
  Lightbulb,
  Building2,
  Wrench,
  Folder
} from "lucide-react";
import axios from "axios";

/* ================= HELPER ================= */

const knownCategories = ["inventory", "supplies", "salary", "utilities", "rent", "maintenance"];

const calculateTotals = (data: any[]) => {
  const totalRevenue = data.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = data.length;
  const averageOrder =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  return { totalRevenue, totalOrders, averageOrder };
};

/* ================= COMPONENT ================= */

export default function Reports() {
  const dispatch = useDispatch<AppDispatch>();

  const { sales } = useSelector((state: RootState) => state.sales);
  const { totals, expenses } = useSelector((state: RootState) => state.expenses);
  const { employees } = useSelector((state: RootState) => state.employees);

  const [reportSummary, setReportSummary] = useState<{
    period: string;
    totalRevenue: number;
    totalOrders: number;
    totalExpenses: number;
    netProfit: number;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchSales({ page: 1, limit: 100000 }));
    dispatch(fetchExpenseTotals());
    dispatch(fetchExpenses());
    dispatch(fetchEmployees("")); // ✅ FIXED HERE
  }, [dispatch]);

  /* ⭐ MAP SALES → DASHBOARD FORMAT */
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

  const { category, setCategory, filteredData } = useDataFilter(dashboardSales);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports", {
          params: { period: category },
        });
        setReportSummary(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    loadReports();
  }, [category]);

  const salesSummary = calculateTotals(filteredData);

  /* ✅ Calculate Active Employee Salary */
  const totalEmployeeSalary = useMemo(() => {
    return employees
      .filter((e) => e.active !== false)
      .reduce((sum, e) => sum + (e.salary || 0), 0);
  }, [employees]);

  const totalExpenses = totals?.totalExpenses ?? 0;

  /* ✅ Net Profit now includes salary */
  const netProfit =
    salesSummary.totalRevenue - (totalExpenses + totalEmployeeSalary);

  /* ⭐ CATEGORY BREAKDOWN */
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};

    (expenses || []).forEach((expense: any) => {
      const key = expense.category;
      map[key] = (map[key] || 0) + Number(expense.amount || 0);
    });

    let others = map["misc"] || 0;
    Object.entries(map).forEach(([key, val]) => {
      if (!knownCategories.includes(key) && key !== "misc") {
        others += val;
      }
    });

    map["others"] = others;

    /* ✅ Inject Employee Salary into breakdown */
    map["salary"] = totalEmployeeSalary;

    return map as Record<string, number>;
  }, [expenses, totalEmployeeSalary]);

  const revenueTrendData = useMemo(
    () => buildRevenueTrendSmart(filteredData, category),
    [filteredData, category]
  );

  const topProductsData = useMemo(
    () => buildTopProducts(filteredData),
    [filteredData]
  );

  return (
    <Flex direction="column" gap="5" width="100%">
      {/* HEADER */}
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
              "All Time","Today","Yesterday","Last 7 Days","Last 14 Days",
              "Last 30 Days","Last 3 Months","Last 6 Months","Last 1 Year",
            ].map((item) => (
              <DropdownMenu.Item key={item} onClick={() => setCategory(item)}>
                {item}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      {/* SUMMARY CARDS */}
      <div className="kb-summary-row">
        <SummaryCard
          title="Total Revenue"
          value={`₹${(reportSummary?.totalRevenue ?? 0).toLocaleString()}`}
          accentColor="#7C4DFF"
          softColor="#F0E9FF"
          icon={<IndianRupee size={22} strokeWidth={2.2} /> as any}
        />

        <SummaryCard
          title="Total Orders"
          value={String(reportSummary?.totalOrders ?? 0)}
          accentColor="#00C853"
          softColor="#E5F9EE"
          icon={<ReceiptText size={22} strokeWidth={2.2} />as any}
        />

        <SummaryCard
          title="Total Expenses"
          value={`₹${(reportSummary?.totalExpenses ?? 0).toLocaleString()}`}
          accentColor="#FF9100"
          softColor="#FFF3E0"
          icon={<TrendingDown size={22} strokeWidth={2.2} />as any}
        />

        <SummaryCard
          title="Net Profit"
          value={
            <span
              style={{
                color: netProfit >= 0 ? "#16A34A" : "#DC2626",
                fontWeight: 600
              }}
            >
              {netProfit < 0 ? "-" : "+"}₹{Math.abs(netProfit).toLocaleString()}
            </span>
          }
          accentColor="#2962FF"
          softColor="#E3F2FD"
          icon={
            netProfit >= 0 ? (
              <TrendingUp size={22} strokeWidth={2.2} />
            ) : (
              <TrendingDown size={22} strokeWidth={2.2} />as any
            )
          }
        />
      </div>

      {/* CHARTS */}
      <Flex gap="4" width="100%">
        <RevenueTrendChart data={revenueTrendData} title={`Sales Trend (${category})`} />
        <TopProductsChart data={topProductsData} />
      </Flex>

      {/* EXPENSE BREAKDOWN */}
      <Text size="4" weight="bold">
        Expense Breakdown
      </Text>

      <div className="kb-summary-row">
        <SummaryCard
            title="Inventory"
            value={`₹${(categoryTotals["inventory"] ?? 0).toLocaleString()}`}
            accentColor="#ECEFF1"
            softColor="#F5F5F5"
            icon={<Package size={22} strokeWidth={2.2} color="#1E88E5" />as any}
          />

          <SummaryCard
            title="Supplies"
            value={`₹${(categoryTotals["supplies"] ?? 0).toLocaleString()}`}
            accentColor="#ECEFF1"
            softColor="#F5F5F5"
            icon={<ShoppingCart size={22} strokeWidth={2.2} color="#00897B" />as any}
          />

          <SummaryCard
            title="Salary"
            value={`₹${(categoryTotals["salary"] ?? 0).toLocaleString()}`}
            accentColor="#ECEFF1"
            softColor="#F5F5F5"
            icon={<BriefcaseBusiness size={22} strokeWidth={2.2} color="#5E35B1" />as any}
          />

          <SummaryCard
            title="Utilities"
            value={`₹${(categoryTotals["utilities"] ?? 0).toLocaleString()}`}
            accentColor="#ECEFF1"
            softColor="#F5F5F5"
            icon={<Lightbulb size={22} strokeWidth={2.2} color="#F9A825" />as any}
          />

          <SummaryCard
            title="Rent"
            value={`₹${(categoryTotals["rent"] ?? 0).toLocaleString()}`}
            accentColor="#ECEFF1"
            softColor="#F5F5F5"
            icon={<Building2 size={22} strokeWidth={2.2} color="#546E7A" />as any}
          />

          <SummaryCard
            title="Maintenance"
            value={`₹${(categoryTotals["maintenance"] ?? 0).toLocaleString()}`}
            accentColor="#ECEFF1"
            softColor="#F5F5F5"
            icon={<Wrench size={22} strokeWidth={2.2} color="#FB8C00" />as any}
          />

          <SummaryCard
            title="Others"
            value={`₹${(categoryTotals["others"] ?? 0).toLocaleString()}`}
            accentColor="#ECEFF1"
            softColor="#F5F5F5"
            icon={<Folder size={22} strokeWidth={2.2} color="#6D6D6D" />as any}
          />
      </div>
    </Flex>
  );
}
