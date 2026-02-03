import React from "react";
import {
  Flex,
  Button,
  Text,
  Dialog,
  IconButton,
  DropdownMenu,
  Badge,
} from "@radix-ui/themes";
import {
  LineChart,
  Line,
  BarChart,
  Rectangle ,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



import { ChevronDown, Plus } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import { mockSalesData } from "../Sales/Sales";
import { calculateTotals } from "../Sales/Sales";
import {
  buildRevenueTrend,
  buildTopProducts,
} from "./ReportsBuilder";


function parseDateTime(dateTime: string): Date {
  // ISO or RFC (backend-friendly)
  if (!isNaN(Date.parse(dateTime))) {
    return new Date(dateTime);
  }

  // YYYY-MM-DD HH:mm:ss
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTime)) {
    return new Date(dateTime.replace(" ", "T"));
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateTime)) {
    const [day, month, year] = dateTime.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  // Fallback (last resort)
  return new Date(dateTime);
}



function filterByDateRange<T extends { dateTime: string }>(
  data: T[],
  range: string
) {
  if (range === "All Time") return data;

  const now = new Date();

  const daysMap: Record<string, number> = {
    "Last 1 Day": 1,
    "Last 7 Days": 7,
    "Last 1 Months": 30,
    "Last 3 Months": 90,
    "Last 6 Months": 180,
    "Last 1 Year": 365,
  };

  const days = daysMap[range];
  if (!days) return data;

  const fromDate = new Date();
  fromDate.setDate(now.getDate() - days);

  return data.filter((item) => {
   const itemDate = parseDateTime(item.dateTime);

    return itemDate >= fromDate;
  });
}

const formatRupeesK = (value: number) => {
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${(value / 1000).toFixed(2)}k`;
};






export default function Reports() {
  const [category, setCategory] = React.useState("All Times");
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  

  const [search, setSearch] = React.useState("");
  
  //  Filter sales data using selected dropdown value
const filteredSales = filterByDateRange(
  mockSalesData,
  category
);

// Calculate summary from filtered data
const salesSummary = calculateTotals(filteredSales);
const revenueTrendData = buildRevenueTrend(filteredSales);
const topProductsData = buildTopProducts(filteredSales);



  
return (

<Flex direction="column" gap="5" width="100%">

   <Flex justify="between" align="center">
        <Text size="8" weight="bold">
          Reports & Analytics
        </Text>

       
          {/* Category Filter */}
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
                "Last 1 Day",
                 "Last 7 Days",
                 "Last 1 Months",
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
  <Flex gap="4" width="100%" >
  
  {/* LEFT: Revenue Trend */}
  <Flex
    direction="column"
    style={{ flex: 1 }}
    className="kb-chart-card"
  >
    <Text weight="bold" mb="2">
      Revenue Trend
    </Text>

    {/* Chart goes here */}
    <div className="kb-card">
  
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={revenueTrendData}>
    <XAxis
      dataKey="date"
      stroke="var(--gray-8)"
      
    />

    <YAxis
      stroke="var(--gray-8)"
     
      tickFormatter={formatRupeesK}
    />
<Tooltip
  contentStyle={{
    backgroundColor: 'var(--tooltip-bg)',
    border: '1px solid var(--tooltip-border)',
    color: 'var(--tooltip-text)', 
  }}
  labelStyle={{
    color: 'var(--tooltip-label)',
  }}
  itemStyle={{
    color: 'var(--tooltip-text)', 
  }}
  formatter={(value) =>
    typeof value === 'number' ? formatRupeesK(value) : ''
  }
/>



    <Line
      type="monotone"
      dataKey="revenue"
      stroke="var(--accent-9)"
      strokeWidth={3}
      dot={{ r: 4 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
  </ResponsiveContainer>
</div>


  </Flex>

  {/* RIGHT: Top Selling Products */}
  <Flex
    direction="column"
    style={{ flex: 1 }}
    className="kb-chart-card"
  >
    <Text weight="bold" mb="2">
      Top Selling Products
    </Text>

    {/* Chart goes here */}
    <div className="kb-card">
      
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={topProductsData} layout="vertical" >
     <XAxis
    type="number"
    allowDecimals={false}
   
  />
  <YAxis
    type="category"
    dataKey="name"
    
  />
      <Tooltip
      cursor={false}
  contentStyle={{
    backgroundColor: 'var(--tooltip-bg)',
    border: '1px solid var(--tooltip-border)',
    color: 'var(--tooltip-text)', 
  }}
  labelStyle={{
    color: 'var(--tooltip-label)',
  }}
  itemStyle={{
    color: 'var(--tooltip-text)', 
  }}
      
      />
     <Bar
  dataKey="count"
  fill="var(--accent-9)"
  barSize={18}
  radius={[0, 6, 6, 0]}
  activeBar={(props) => (
    <Rectangle
      {...props}
      height={props.height + 12}   
      y={props.y - 8}             
      fill="var(--accent-9)"
    />
  )}
/>
    </BarChart>
  </ResponsiveContainer>
</div>


  </Flex>

 </Flex>
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