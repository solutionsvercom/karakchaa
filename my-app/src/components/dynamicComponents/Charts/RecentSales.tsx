// src/components/dynamicComponents/RecentSales.tsx
import React from "react";
import { Flex, Text, Button } from "@radix-ui/themes";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Sale } from "../../../features/SalesSlice";

interface RecentSalesProps {
  sales: Sale[];
  limit?: number;
  showViewAll?: boolean;
}

export const RecentSales: React.FC<RecentSalesProps> = ({
  sales,
  limit = 10,
  showViewAll = true,
}) => {
  const navigate = useNavigate();

  const recentSales = [...sales]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
    return styles[payment.toLowerCase() as keyof typeof styles] || styles.pending;
  };

  // Helper function to get customer name - matches Sales table exactly
  const getCustomerName = (sale: Sale) => {
    // First check for populated customer object (from backend)
    if (sale.customer?.fullName) return sale.customer.fullName;
    // Then check for customerName field
    if (sale.customerName) return sale.customerName;
    // Default to Walk-in
    return "Walk-in";
  };

  // Helper function to get items display - matches Sales table
  const getItemsDisplay = (sale: Sale) => {
    // If items array exists and has items
    if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
      return sale.items.map((item: { name: string }) => item.name).join(", ");
    }
    // If single product
    if (sale.product?.name) return sale.product.name;
    // Default
    return "-";
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
                key={sale._id}
                p="3"
                gap="3"
                align="center"
                style={{
                  borderBottom: "1px solid var(--gray-a3)",
                }}
              >
                <Text size="2" weight="medium" style={{ flex: "0 0 120px" }}>
                  #{sale.invoiceNumber}
                </Text>
                <Text size="2" style={{ flex: "1 1 150px" }}>
                  {getCustomerName(sale)}
                </Text>
                <Text size="2" color="gray" style={{ flex: "1 1 100px" }}>
                  {getItemsDisplay(sale)}
                </Text>
                <Text size="2" weight="medium" style={{ flex: "0 0 100px" }}>
                  ₹{sale.totalAmount}
                </Text>
                <Flex style={{ flex: "0 0 100px" }}>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      backgroundColor: getPaymentStyle(sale.paymentStatus).bg,
                      color: getPaymentStyle(sale.paymentStatus).text,
                    }}
                  >
                    {sale.paymentStatus}
                  </span>
                </Flex>
                <Text size="2" color="gray" style={{ flex: "0 0 100px" }}>
                  {formatTime(sale.createdAt)}
                </Text>
              </Flex>
            ))
          )}
        </Flex>
      </div>
    </Flex>
  );
};