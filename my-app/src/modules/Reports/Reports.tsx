import React from "react";
import { Flex, Button, Text, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";
import { useDataFilter } from "../../hooks/useDataFilter";
import { mockSalesData, calculateTotals } from "../Sales/Sales";
import { RevenueTrendChart, TopProductsChart,buildRevenueTrendSmart,buildTopProducts, } from "../../components/dynamicComponents/Charts";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
export default function Reports() {
  const { category, setCategory, filteredData } = useDataFilter(mockSalesData);

  const salesSummary = calculateTotals(filteredData);
 const revenueTrendData = buildRevenueTrendSmart(filteredData, category);
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
              <DropdownMenu.Item key={item} onClick={() => setCategory(item)}>
                {item}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      {/* ===== SUMMARY CARDS ===== */}
       {/* ===== SUMMARY CARDS (4) ===== */}
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
            value={String()}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon="💵"
          />
          <SummaryCard
            title="Net Profit"
            value={String()}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon="📈"
          />
        </div>


      {/* ===== CHARTS ROW ===== */}
      <Flex gap="4" width="100%">
        <RevenueTrendChart data={revenueTrendData} />
        <TopProductsChart data={topProductsData} />
      </Flex>

      {/* Rest of your expense breakdown... */}
       <Text size="4" weight="bold">
          Expense Breakdown
        </Text>

<div className="kb-summary-row">
          <SummaryCard
            title="Inventory"
             value="₹0"
            accentColor=""
            softColor=""
            icon=""
          />
          <SummaryCard
            title="Supplies"
             value="₹0"

            accentColor=""
            softColor=""
           icon=""
          />
          <SummaryCard
            title="Salary"
             value="₹0"
            accentColor=""
            softColor=""
            icon=""
          />
          <SummaryCard
            title="Utilities"
             value="₹0"
            accentColor=""
            softColor=""
            icon=""
          />
          <SummaryCard
            title="Rent"
             value="₹0"

            accentColor=""
            softColor=""
           icon=""
          />
          <SummaryCard
            title="Maintenance"
             value="₹0"
            accentColor=""
            softColor=""
            icon=""
          />
          <SummaryCard
            title="Others"
            value="₹0"
            accentColor=""
            softColor=""
            icon=""
          />

        </div>
    </Flex>
  );
}