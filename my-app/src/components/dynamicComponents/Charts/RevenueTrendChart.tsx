import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import {
  AreaChart,
  Area,
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
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-9)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-9)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis dataKey="date" stroke="var(--gray-8)" />
            <YAxis stroke="var(--gray-8)" tickFormatter={formatRupeesK} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg)",
                border: "1px solid var(--tooltip-border)",
                color: "var(--tooltip-text)",
              }}
              labelStyle={{ color: "var(--tooltip-label)" }}
              itemStyle={{ color: "var(--tooltip-text)" }}
              formatter={(value) =>
                typeof value === "number" ? formatRupeesK(value) : ""
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--accent-9)"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 6, fill: "var(--accent-9)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Flex>
  );
};