import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueTrendData {
  date: string;
  revenue: number;
}

interface RevenueTrendChartProps {
  data: RevenueTrendData[];
  title?: string;
  height?: number;
  showTitle?: boolean;
}

const formatRupeesK = (value: number) => {
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${(value / 1000).toFixed(2)}k`;
};

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data,
  title = "Revenue Trend",
  height = 250,
  showTitle = true,
}) => {
  return (
    <Flex direction="column" style={{ flex: 1 }} className="kb-chart-card">
      {showTitle && (
        <Text weight="bold" mb="2">
          {title}
        </Text>
      )}

      <div className="kb-card">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="var(--gray-8)" />
            <YAxis stroke="var(--gray-8)" tickFormatter={formatRupeesK} />
            <Tooltip
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
              formatter={(value) =>
                typeof value === "number" ? formatRupeesK(value) : ""
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
  );
};