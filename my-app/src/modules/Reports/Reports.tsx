// import React from "react";
// import { Flex, Button, Text, DropdownMenu } from "@radix-ui/themes";
// import { ChevronDown } from "lucide-react";
// import { useDataFilter } from "../../hooks/useDataFilter";
// import { mockSalesData, calculateTotals } from "../Sales/Sales";
// import { ExpenseTransaction, calculateExpenseTotals,mockExpenses } from "../Expenses/Expenses";
// import { RevenueTrendChart, TopProductsChart,buildRevenueTrendSmart,buildTopProducts, } from "../../components/dynamicComponents/Charts";
// import { SummaryCard } from "../../components/dynamicComponents/Cards";



// export default function Reports() {
//   const { category, setCategory, filteredData } = useDataFilter(mockSalesData);
//   const salesSummary = calculateTotals(filteredData);
//   const {
//   totalExpenses,
//   thisMonthExpenses,
//   totalTransactions,
//   averageExpense,
// } = calculateExpenseTotals(mockExpenses);
// const netProfit = salesSummary.totalRevenue - totalExpenses;

//  const revenueTrendData = buildRevenueTrendSmart(filteredData, category);
//   const topProductsData = buildTopProducts(filteredData);

//   return (
//     <Flex direction="column" gap="5" width="100%">
//       <Flex justify="between" align="center">
//         <Text size="8" weight="bold">
//           Reports & Analytics
//         </Text>

//         <DropdownMenu.Root>
//           <DropdownMenu.Trigger>
//             <Button variant="outline">
//               {category}
//               <ChevronDown size={16} />
//             </Button>
//           </DropdownMenu.Trigger>

//           <DropdownMenu.Content>
//             {[
//               "All Time",
//               "Today",
//               "Yesterday",
//               "Last 7 Days",
//               "Last 14 Days",
//               "Last 30 Days",
//               "Last 3 Months",
//               "Last 6 Months",
//               "Last 1 Year",
//             ].map((item) => (
//               <DropdownMenu.Item key={item} onClick={() => setCategory(item)}>
//                 {item}
//               </DropdownMenu.Item>
//             ))}
//           </DropdownMenu.Content>
//         </DropdownMenu.Root>
//       </Flex>

//       {/* ===== SUMMARY CARDS ===== */}
//        {/* ===== SUMMARY CARDS (4) ===== */}
//         <div className="kb-summary-row">
//           <SummaryCard
//             title="Total Revenue"
//             value={`₹${salesSummary.totalRevenue.toLocaleString()}`}
//             accentColor="#7C4DFF"
//             softColor="#F0E9FF"
//             icon="₹"
//           />
//           <SummaryCard
//             title="Total Orders"
//             value={String(salesSummary.totalOrders)}

//             accentColor="#00C853"
//             softColor="#E5F9EE"
//            icon="🛒"
//           />
//           <SummaryCard
//             title="Total Expenses"
//             value={String( totalExpenses)}
//             accentColor="#FF9100"
//             softColor="#FFF3E0"
//             icon="💵"
//           />
//          <SummaryCard
//   title="Net Profit"
//   value={
//     <span
//       style={{
//         color: netProfit >= 0 ? "#16A34A" : "#DC2626",
//         fontWeight: 600,
//       }}
//     >
//       {netProfit < 0 ? "-" : "+"}
//       ₹{Math.abs(netProfit).toLocaleString()}
//     </span>
//   }
//   accentColor="#2962FF"
//   softColor="#E3F2FD"
//   icon={netProfit >= 0 ? "📈" : "📉"}   
// />

//         </div>


//       {/* ===== CHARTS ROW ===== */}
//       <Flex gap="4" width="100%">
//         <RevenueTrendChart data={revenueTrendData} />
//         <TopProductsChart data={topProductsData} />
//       </Flex>

//       {/* Rest of your expense breakdown... */}
//        <Text size="4" weight="bold">
//           Expense Breakdown
//         </Text>

// <div className="kb-summary-row">
//           <SummaryCard
//             title="Inventory"
//              value="₹0"
//             accentColor=""
//             softColor=""
//             icon=""
//           />
//           <SummaryCard
//             title="Supplies"
//              value="₹0"

//             accentColor=""
//             softColor=""
//            icon=""
//           />
//           <SummaryCard
//             title="Salary"
//              value="₹0"
//             accentColor=""
//             softColor=""
//             icon=""
//           />
//           <SummaryCard
//             title="Utilities"
//              value="₹0"
//             accentColor=""
//             softColor=""
//             icon=""
//           />
//           <SummaryCard
//             title="Rent"
//              value="₹0"

//             accentColor=""
//             softColor=""
//            icon=""
//           />
//           <SummaryCard
//             title="Maintenance"
//              value="₹0"
//             accentColor=""
//             softColor=""
//             icon=""
//           />
//           <SummaryCard
//             title="Others"
//             value="₹0"
//             accentColor=""
//             softColor=""
//             icon=""
//           />

//         </div>
//     </Flex>
//   );
// }



import React, { useEffect } from "react";
import { Flex, Button, Text, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";
import { useDataFilter } from "../../hooks/useDataFilter";
import { mockSalesData, calculateTotals } from "../Sales/Sales";
import {
  RevenueTrendChart,
  TopProductsChart,
  buildRevenueTrendSmart,
  buildTopProducts,
} from "../../components/dynamicComponents/Charts";
import { SummaryCard } from "../../components/dynamicComponents/Cards";

// ✅ Redux
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/Store";
import { fetchExpenses, fetchExpenseTotals } from "../../features/ExpensesSlice";

export default function Reports() {
  const dispatch = useDispatch<any>();

  // Sales data (still using mock sales for now)
  const { category, setCategory, filteredData } = useDataFilter(mockSalesData);
  const salesSummary = calculateTotals(filteredData);

  // ✅ Expenses data from Redux/API
  const { expenses, totals } = useSelector((state: RootState) => state.expenses);

  useEffect(() => {
    // Ensure reports has latest expense totals too
    dispatch(fetchExpenses());
    dispatch(fetchExpenseTotals());
  }, [dispatch]);

  const totalExpenses = totals?.totalExpenses ?? 0;
  const netProfit = salesSummary.totalRevenue - totalExpenses;

  const revenueTrendData = buildRevenueTrendSmart(filteredData, category);
  const topProductsData = buildTopProducts(filteredData);

  // ✅ Optional: expense breakdown by category (based on fetched expenses)
  const expenseByCategory = (expenses || []).reduce<Record<string, number>>(
    (acc, e: any) => {
      const key = e.category || "misc";
      acc[key] = (acc[key] || 0) + Number(e.amount || 0);
      return acc;
    },
    {}
  );

  const getAmt = (key: string) => `₹${Number(expenseByCategory[key] || 0).toLocaleString()}`;

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
              {netProfit < 0 ? "-" : "+"}₹{Math.abs(netProfit).toLocaleString()}
            </span>
          }
          accentColor="#2962FF"
          softColor="#E3F2FD"
          icon={netProfit >= 0 ? "📈" : "📉"}
        />
      </div>

      {/* ===== CHARTS ROW ===== */}
      <Flex gap="4" width="100%">
        <RevenueTrendChart data={revenueTrendData} />
        <TopProductsChart data={topProductsData} />
      </Flex>

      {/* ===== EXPENSE BREAKDOWN ===== */}
      <Text size="4" weight="bold">
        Expense Breakdown
      </Text>

      <div className="kb-summary-row">
        <SummaryCard title="Inventory" value={getAmt("inventory")} accentColor="" softColor="" icon="" />
        <SummaryCard title="Supplies" value={getAmt("supplies")} accentColor="" softColor="" icon="" />
        <SummaryCard title="Salary" value={getAmt("salary")} accentColor="" softColor="" icon="" />
        <SummaryCard title="Utilities" value={getAmt("utilities")} accentColor="" softColor="" icon="" />
        <SummaryCard title="Rent" value={getAmt("rent")} accentColor="" softColor="" icon="" />
        <SummaryCard title="Maintenance" value={getAmt("maintenance")} accentColor="" softColor="" icon="" />
        <SummaryCard
          title="Others"
          value={`₹${Number(
            (expenseByCategory["misc"] || 0) +
              (expenseByCategory["marketing"] || 0) +
              (expenseByCategory["transport"] || 0) +
              (expenseByCategory["taxes"] || 0)
          ).toLocaleString()}`}
          accentColor=""
          softColor=""
          icon=""
        />
      </div>
    </Flex>
  );
}
