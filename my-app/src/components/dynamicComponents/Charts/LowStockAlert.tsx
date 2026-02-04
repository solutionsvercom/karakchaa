// src/components/dynamicComponents/LowStockAlert.tsx
import React from "react";
import { Flex, Text, Button } from "@radix-ui/themes";
import { Package, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StockItem, getStockLabel } from "../../../modules/Stockmanagement/Stockmanagement";

interface LowStockAlertProps {
  products: StockItem[];
  showViewAll?: boolean;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({
  products,
  showViewAll = true,
}) => {
  const navigate = useNavigate();

  // Filter only low stock and out of stock products
  const lowStockProducts = products.filter(
    (product) => product.status === "low-stock" || product.status === "out-of-stock"
  );

  const handleViewAll = () => {
    navigate("/Dashboard/Stockmanagement");
  };

  return (
    <Flex direction="column" className="kb-chart-card" style={{ flex: 1 }}>
      <Flex justify="between" align="center" mb="3">
        <Text weight="bold" size="4">
          Low Stock Alert
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

      <div className="kb-card" style={{ minHeight: "250px" }}>
        {lowStockProducts.length === 0 ? (
          // All stock levels are healthy
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="3"
            style={{ height: "250px" }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "var(--gray-a3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package size={40} color="var(--gray-9)" strokeWidth={1.5} />
            </div>
            <Text size="3" color="gray" align="center">
              All stock levels are healthy
            </Text>
          </Flex>
        ) : (
          // Show low stock products
          <Flex direction="column" gap="2">
            {lowStockProducts.slice(0, 5).map((product) => (
              <Flex
                key={product.id}
                justify="between"
                align="center"
                p="3"
                style={{
                  borderRadius: "8px",
                  backgroundColor:
                    product.status === "out-of-stock"
                      ? "var(--red-a2)"
                      : "var(--orange-a2)",
                  border:
                    product.status === "out-of-stock"
                      ? "1px solid var(--red-a6)"
                      : "1px solid var(--orange-a6)",
                }}
              >
                <Flex direction="column" gap="1">
                  <Text weight="medium" size="3">
                    {product.product}
                  </Text>
                  <Text size="2" color="gray">
                    Current: {product.currentStock} | Min: {product.minLevel}
                  </Text>
                </Flex>
                <Flex
                  px="3"
                  py="1"
                  style={{
                    borderRadius: "4px",
                    backgroundColor:
                      product.status === "out-of-stock"
                        ? "var(--red-9)"
                        : "var(--orange-9)",
                    color: "white",
                  }}
                >
                  <Text size="2" weight="medium">
                    {getStockLabel(product.status)}
                  </Text>
                </Flex>
              </Flex>
            ))}

            {lowStockProducts.length > 5 && (
              <Button
                variant="soft"
                onClick={handleViewAll}
                style={{ marginTop: "8px" }}
              >
                View All {lowStockProducts.length} Low Stock Items
              </Button>
            )}
          </Flex>
        )}
      </div>
    </Flex>
  );
};