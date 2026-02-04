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
          <BarChart data={limitedData} layout="vertical">
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" />
            <Tooltip
            cursor={{ fill: "var(--gray-a3)" }}
              
              contentStyle={{
                backgroundColor: "var(--tooltip-bg)",
                border: "1px solid var(--tooltip-border)",
                color: "var(--tooltip-text)",
              }}
              labelStyle={{
                color: "var(--tooltip-label)",
              }}
              itemStyle={{
                color: "var(--tooltip-text)",
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--accent-9)"
              barSize={barSize}
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
  );
};