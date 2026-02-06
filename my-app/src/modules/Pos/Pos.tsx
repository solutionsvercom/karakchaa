import React, { useMemo, useState } from "react";
import { Flex, Box, Text, Select, Card } from "@radix-ui/themes";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import ProductCard from "../../components/dynamicComponents/ProductCard";
import Cart from "./Cart";
import { useCart } from "./CartContext";
/* ---------------- TYPES ---------------- */

type Category = "snacks" | "desserts" | "beverages" | "meals" | "other";

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: Category;
};

/* ---------------- MOCK DATA ---------------- */

const PRODUCTS: Product[] = [
  { id: 1, name: "Thali Meal", sku: "TH-001", price: 150, stock: 12, category: "meals" },
  { id: 2, name: "Gulab Jamun", sku: "DS-001", price: 50, stock: 20, category: "desserts" },
  { id: 3, name: "Rasgulla", sku: "DS-002", price: 45, stock: 8, category: "desserts" },
  { id: 4, name: "Lemon Tea", sku: "BV-001", price: 35, stock: 30, category: "beverages" },
  { id: 5, name: "Samosa", sku: "SN-001", price: 30, stock: 25, category: "snacks" },
];

/* ---------------- COMPONENT ---------------- */

export default function Pos() {
  const { addItem } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"pos" | "digital">("pos");

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" ? true : p.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    // <Flex direction="column" gap="4" style={{ height: "100%" }}>
      <Flex
  direction="column"
  gap="4"
  style={{
    height: "calc(100vh - 64px)", // adjust if your navbar height differs
    minHeight: 0,
  }}
>
      {/* ---------------- POS / DIGITAL SWITCH ---------------- */}
      <Box
        style={{
          background: "var(--gray-2)",
          padding: 6,
          borderRadius: 12,
          maxWidth: 520,
        }}
      >
        <Flex gap="2">
          <Box
            onClick={() => setActiveTab("pos")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "center",
              fontWeight: 500,
              background:
                activeTab === "pos" ? "var(--violet-9)" : "transparent",
              color: activeTab === "pos" ? "white" : "var(--gray-12)",
            }}
          >
            🛒 Point of Sale
          </Box>

          <Box
            onClick={() => setActiveTab("digital")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "center",
              fontWeight: 500,
              background:
                activeTab === "digital" ? "var(--violet-9)" : "transparent",
              color: activeTab === "digital" ? "white" : "var(--gray-12)",
            }}
          >
            🔔 Digital Menu Orders
          </Box>
        </Flex>
      </Box>

      {/* ---------------- POS CONTENT ---------------- */}
      {activeTab === "pos" && (
        // <Flex gap="4" style={{ flex: 1 }}>
          <Flex gap="4" style={{ flex: 1, minHeight: 0 }}>
          {/* LEFT : PRODUCTS */}
          <Flex direction="column" gap="4" style={{ flex: 1 }}>
            {/* SEARCH + FILTER */}
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <Searchbar
                  searchValue={search}
                  onSearchChange={setSearch}
                  placeholder="Search products..."
                />
              </Box>

              <Select.Root value={category} onValueChange={setCategory}>
                <Select.Trigger style={{ width: 180 }} />
                <Select.Content>
                  <Select.Item value="all">All Categories</Select.Item>
                  <Select.Item value="meals">Meals</Select.Item>
                  <Select.Item value="snacks">Snacks</Select.Item>
                  <Select.Item value="desserts">Desserts</Select.Item>
                  <Select.Item value="beverages">Beverages</Select.Item>
                  <Select.Item value="other">Other</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* PRODUCT GRID */}
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 16,
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {filteredProducts.map((product) => (
             <ProductCard
                key={product.id}
                name={product.name}
                sku={product.sku}
                price={product.price}
                stock={product.stock}
                category={product.category}
                variant="pos"
                onAdd={() =>
                  addItem({
                    id: String(product.id),
                    name: product.name,
                    price: product.price,
                  })
                }
              />
              ))}
            </Box>
          </Flex>

          {/* RIGHT : CURRENT ORDER */}
         <Card
  style={{
    width: 320,
    height: "100%",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  }}
>
  <Cart />
</Card>
        </Flex>
      )}

      {/* ---------------- DIGITAL ORDERS ---------------- */}
      {activeTab === "digital" && (
        <Flex
          align="center"
          justify="center"
          style={{ height: 300 }}
        >
          <Text color="gray">
            Digital menu orders will appear here
          </Text>
        </Flex>
      )}
    </Flex>
  );
}