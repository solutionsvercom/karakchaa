// src/components/dynamicComponents/RecentSales.tsx
import React from "react";
import { Flex, Text, Button } from "@radix-ui/themes";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { SaleTransaction } from "../../../modules/Sales/Sales"; // 👈 IMPORT TYPE

interface RecentSalesProps {
  sales: SaleTransaction[]; // 👈 USE IMPORTED TYPE
  limit?: number;
  showViewAll?: boolean;
}

export const RecentSales: React.FC<RecentSalesProps> = ({
  sales,
  limit = 10,
  showViewAll = true,
}) => {
  const navigate = useNavigate();

  const recentSales = sales
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, limit);

  const handleViewAll = () => {
    navigate("/Dashboard/Sales");
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPaymentStyle = (payment: string) => {
    const styles = {
      completed: { bg: "var(--green-a2)", text: "var(--green-11)" },
      pending: { bg: "var(--yellow-a2)", text: "var(--yellow-11)" },
      cancelled: { bg: "var(--red-a2)", text: "var(--red-11)" },
    };
    return styles[payment as keyof typeof styles] || styles.pending;
  };

  return (
    <Flex direction="column" className="kb-chart-card" style={{ flex: 1 }}>
      <Flex justify="between" align="center" mb="3">
        <Text weight="bold" size="4">
          Recent Sales
        </Text>
        {showViewAll && (
          <Button
            variant="ghost"
            size="2"
            onClick={handleViewAll}
            style={{ cursor: "pointer" }}
          >
            View All
            <ArrowRight size={16} />
          </Button>
        )}
      </Flex>

      <div className="kb-card" style={{ overflow: "auto" }}>
        {/* Table Header */}
        <Flex
          p="3"
          gap="3"
          style={{
            borderBottom: "1px solid var(--gray-a6)",
            backgroundColor: "var(--gray-a2)",
          }}
        >
          <Text size="2" weight="medium" color="gray" style={{ flex: "0 0 120px" }}>
            INVOICE
          </Text>
          <Text size="2" weight="medium" color="gray" style={{ flex: "1 1 150px" }}>
            CUSTOMER
          </Text>
          <Text size="2" weight="medium" color="gray" style={{ flex: "1 1 100px" }}>
            ITEMS
          </Text>
          <Text size="2" weight="medium" color="gray" style={{ flex: "0 0 100px" }}>
            AMOUNT
          </Text>
          <Text size="2" weight="medium" color="gray" style={{ flex: "0 0 100px" }}>
            PAYMENT
          </Text>
          <Text size="2" weight="medium" color="gray" style={{ flex: "0 0 100px" }}>
            TIME
          </Text>
        </Flex>

        {/* Table Body */}
        <Flex direction="column">
          {recentSales.length === 0 ? (
            <Flex align="center" justify="center" p="6">
              <Text size="3" color="gray">
                No recent sales
              </Text>
            </Flex>
          ) : (
            recentSales.map((sale) => (
              <Flex
                key={sale.id}
                p="3"
                gap="3"
                align="center"
                style={{
                  borderBottom: "1px solid var(--gray-a3)",
                }}
              >
                <Text size="2" weight="medium" style={{ flex: "0 0 120px" }}>
                  #{sale.invoice}
                </Text>
                <Text size="2" style={{ flex: "1 1 150px" }}>
                  {sale.customer}
                </Text>
                <Text size="2" color="gray" style={{ flex: "1 1 100px" }}>
                  {sale.items}
                </Text>
                <Text size="2" weight="medium" style={{ flex: "0 0 100px" }}>
                  ₹{sale.amount}
                </Text>
                <Flex style={{ flex: "0 0 100px" }}>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      backgroundColor: getPaymentStyle(sale.payment).bg,
                      color: getPaymentStyle(sale.payment).text,
                    }}
                  >
                    {sale.payment}
                  </span>
                </Flex>
                <Text size="2" color="gray" style={{ flex: "0 0 100px" }}>
                  {formatTime(sale.dateTime)}
                </Text>
              </Flex>
            ))
          )}
        </Flex>
      </div>
    </Flex>
  );
};