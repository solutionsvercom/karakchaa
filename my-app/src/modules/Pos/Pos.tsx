import React, { useMemo, useState, useEffect } from "react";
import { Flex, Box, Text, Select, Card } from "@radix-ui/themes";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckoutDialog } from "./CheckoutDialog";

import Searchbar from "../../components/dynamicComponents/Searchbar";
import ProductCard from "../../components/dynamicComponents/ProductCard";
import Cart from "./Cart";
import { useCart } from "./CartContext";

import { RootState, AppDispatch } from "../../store/Store";
import { fetchProducts } from "../../features/ProductsSlice";

import DigitalOrdersBoard from "./DigitalOrdersBoard";

/* ---------------- TYPES ---------------- */

type Category = "snacks" | "desserts" | "beverages" | "meals" | "other";

/* ---------------- COMPONENT ---------------- */

export default function Pos() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCheckoutMode = location.pathname.includes("/create-sale");

  const dispatch = useDispatch<AppDispatch>();
  const { addItem, items } = useCart();

  const { products } = useSelector((state: RootState) => state.product);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"pos" | "digital">("pos");

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  /* ================= FILTER PRODUCTS ================= */

  const filteredProducts = useMemo(() => {
    return products
      .filter((p: any) => p.isActive)
      .filter((p: any) => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
          category === "all" ? true : p.category === category;

        return matchesSearch && matchesCategory;
      });
  }, [products, search, category]);

  /* ================= CART QTY ================= */

  const getCartQty = (id: string) => {
    const item = items.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  /* ================= UI ================= */

  return (
    <Flex
      direction="column"
      gap="4"
      style={{ height: "calc(100vh - 64px)", minHeight: 0 }}
    >
      {/* ================= TAB SWITCH ================= */}
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
                activeTab === "pos" ? "var(--accent-9)" : "transparent",
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
                activeTab === "digital" ? "var(--accent-9)" : "transparent",
              color: activeTab === "digital" ? "white" : "var(--gray-12)",
            }}
          >
            🔔 Digital Menu Orders
          </Box>
        </Flex>
      </Box>

      {/* ================= POS TAB ================= */}
      {activeTab === "pos" && (
        <Flex gap="4" style={{ flex: 1, minHeight: 0 }}>
          <Flex direction="column" gap="4" style={{ flex: 1 }}>
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

            <Box
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 16,
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {filteredProducts.map((product: any) => {
                const cartQty = getCartQty(product._id);
                const remainingStock = product.stockQty - cartQty;

                return (
                  <ProductCard
                    key={product._id}
                    name={product.name}
                    sku={product.sku}
                    price={product.sellingPrice}
                    stock={remainingStock}
                    category={product.category}
                    variant="pos"
                    onAdd={() => {
                      if (remainingStock <= 0) return;
                      addItem({
                        id: product._id,
                        name: product.name,
                        price: product.sellingPrice,
                      });
                    }}
                  />
                );
              })}
            </Box>
          </Flex>

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

      {/* ================= DIGITAL TAB (🔥 FIXED) ================= */}
      {activeTab === "digital" && (
        <div
          className="w-full h-full"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <DigitalOrdersBoard />
        </div>
      )}

      {/* ================= CHECKOUT DIALOG ================= */}
      <CheckoutDialog
        open={isCheckoutMode}
        onClose={() => navigate("/dashboard/pos")}
        discount={0}
      />
    </Flex>
  );
}
