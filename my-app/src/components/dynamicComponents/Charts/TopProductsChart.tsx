import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopProductData {
  name: string;
  count: number;
}

interface TopProductsChartProps {
  data: TopProductData[];
  title?: string;
  height?: number;
  showTitle?: boolean;
  maxProducts?: number;
  barSize?: number;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({
  data,
  title = "Top Selling Products",
  height = 250,
  showTitle = true,
  maxProducts = 5,
 barSize = 40,
}) => {
  // Limit to top N products
  const limitedData = data.slice(0, maxProducts);

  return (
    <Flex direction="column" style={{ flex: 1 }} className="kb-chart-card">
      {showTitle && (
        <Text weight="bold" mb="2">
          {title}
        </Text>
      )}

      <div className="kb-card">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={limitedData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
          >
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 12, fill: "var(--gray-11)" }}
              tickFormatter={(value: string) =>
                value.length > 14 ? value.slice(0, 14) + "…" : value
              }
            />
            <Tooltip
              cursor={{ fill: "var(--gray-a3)" }}
              position={{ x: 130, y: undefined as any }}
              contentStyle={{
                backgroundColor: "var(--color-panel-solid)",
                border: "1px solid var(--gray-a6)",
                borderRadius: 8,
                fontSize: 13,
                padding: "6px 12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              }}
              labelStyle={{ fontWeight: 600, color: "var(--gray-12)", marginBottom: 2 }}
              itemStyle={{ color: "var(--gray-11)" }}
              formatter={(value: number | undefined) => [value ?? 0, "Sales"]}
            />
           <Bar
  dataKey="count"
  fill="var(--accent-9)"
  barSize={barSize}
  radius={[0, 6, 6, 0]}
  activeBar={<Rectangle fill="var(--accent-7)" radius={[0, 6, 6, 0]} />}
/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Flex>
  );
};