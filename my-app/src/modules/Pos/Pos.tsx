import React, { useMemo, useState, useEffect } from "react";
import { Flex, Box, Text, Select, Card } from "@radix-ui/themes";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckoutDialog } from "./CheckoutDialog";
import { ShoppingCart, X } from "lucide-react";

import Searchbar from "../../components/dynamicComponents/Searchbar";
import ProductCard from "../../components/dynamicComponents/ProductCard";
import Cart from "./Cart";
import { useCart } from "./CartContext";

import { RootState, AppDispatch } from "../../store/Store";
import { fetchProducts } from "../../features/ProductsSlice";

import DigitalOrdersBoard from "./DigitalOrdersBoard";

type Category = "snacks" | "desserts" | "beverages" | "meals" | "other";

export default function Pos() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCheckoutMode = location.pathname.includes("/create-sale");

  const dispatch = useDispatch<AppDispatch>();
  const { addItem, items, total } = useCart();

  const { products } = useSelector((state: RootState) => state.product);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"pos" | "digital">("pos");
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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

  const getCartQty = (id: string) => {
    const item = items.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  // Close cart when backdrop is clicked
  const handleBackdropClick = () => setIsCartOpen(false);

  return (
    <Flex
      direction="column"
      gap="4"
      style={{ height: "calc(100vh - 64px)", minHeight: 0, position: "relative" }}
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
              background: activeTab === "pos" ? "var(--accent-9)" : "transparent",
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
              background: activeTab === "digital" ? "var(--accent-9)" : "transparent",
              color: activeTab === "digital" ? "white" : "var(--gray-12)",
            }}
          >
            🔔 Digital Menu Orders
          </Box>
        </Flex>
      </Box>

      {/* ================= POS TAB ================= */}
      {activeTab === "pos" && (
        <>
          {/* Desktop layout */}
          <Flex gap="4" style={{ flex: 1, minHeight: 0 }} className="pos-desktop-layout">
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
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 16,
                  overflowY: "auto",
                  paddingRight: 6,
                  paddingBottom: 16,
                }}
                className="pos-product-grid"
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

            {/* Desktop Cart Sidebar */}
            <Card
              className="pos-cart-sidebar"
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

          {/* ================= MOBILE CART FAB ================= */}
          {totalItems > 0 && (
            <button
              className="pos-cart-fab"
              onClick={() => setIsCartOpen(true)}
              style={{
                position: "fixed",
                bottom: 24,
                right: 20,
                zIndex: 200,
                display: "none", // shown via CSS on mobile
                alignItems: "center",
                gap: 10,
                background: "var(--accent-9)",
                color: "white",
                border: "none",
                borderRadius: 999,
                padding: "14px 22px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
              }}
            >
              <ShoppingCart size={20} />
              <span>{totalItems} item{totalItems > 1 ? "s" : ""}</span>
              <span
                style={{
                  background: "rgba(255,255,255,0.25)",
                  borderRadius: 999,
                  padding: "2px 10px",
                  fontSize: 14,
                }}
              >
                ₹{total}
              </span>
            </button>
          )}

          {/* ================= MOBILE CART DRAWER ================= */}
          {/* Backdrop */}
          <div
            className="pos-cart-backdrop"
            onClick={handleBackdropClick}
            style={{
              display: "none", // shown via CSS on mobile
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 300,
              opacity: isCartOpen ? 1 : 0,
              pointerEvents: isCartOpen ? "auto" : "none",
              transition: "opacity 0.25s ease",
            }}
          />

          {/* Drawer Panel */}
          <div
            className="pos-cart-drawer"
            style={{
              display: "none", // shown via CSS on mobile
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 301,
              background: "var(--gray-1)",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
              maxHeight: "85vh",
              transform: isCartOpen ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              flexDirection: "column",
            }}
          >
            {/* Drawer handle */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "12px 0 4px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 999,
                  background: "var(--gray-6)",
                }}
              />
            </div>

            {/* Drawer close button */}
            <button
              onClick={() => setIsCartOpen(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "var(--gray-3)",
                border: "none",
                borderRadius: 999,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--gray-11)",
              }}
            >
              <X size={16} />
            </button>

            {/* Cart content */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              <Cart onCheckout={() => setIsCartOpen(false)} />
            </div>
          </div>
        </>
      )}

      {/* ================= DIGITAL TAB ================= */}
      {activeTab === "digital" && (
        <div
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

      {/* ================= MOBILE-SPECIFIC STYLES ================= */}
      <style>{`
        /* ===== MOBILE: < 768px ===== */
        @media (max-width: 767px) {
          .pos-cart-sidebar {
            display: none !important;
          }
          .pos-cart-fab {
            display: flex !important;
          }
          .pos-cart-backdrop {
            display: block !important;
          }
          .pos-cart-drawer {
            display: flex !important;
          }
          .pos-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
            gap: 12px !important;
            padding-bottom: 100px !important; /* Space for FAB */
          }
          .pos-desktop-layout {
            flex-direction: column !important;
          }
        }

        /* ===== TABLET: 768px – 1023px ===== */
        @media (min-width: 768px) and (max-width: 1023px) {
          .pos-cart-sidebar {
            width: 280px !important;
          }
          .pos-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
          }
        }
      `}</style>
    </Flex>
  );
}
