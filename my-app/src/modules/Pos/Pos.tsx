import React, { useMemo, useState, useEffect, useRef } from "react";
import { Flex, Box, Select, Card } from "@radix-ui/themes";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckoutDialog } from "./CheckoutDialog";
import { ShoppingCart, X, Bell, Monitor, TabletSmartphone } from "lucide-react";

import Searchbar from "../../components/dynamicComponents/Searchbar";
import ProductCard from "../../components/dynamicComponents/ProductCard";
import Cart from "./Cart";
import { useCart } from "./CartContext";

import { RootState, AppDispatch } from "../../store/Store";
import { fetchProducts } from "../../features/ProductsSlice";
import { fetchProductCategories } from "../../features/ProductCategoriesSlice";
import { fetchOrders } from "../../features/OrdersSlice";
import { categoryLabelForSlug } from "../../utils/categoryDisplay";
import { sortByPrice, type PriceSortOrder } from "../../utils/sortByPrice";

import DigitalOrdersBoard, { type SourceFilter } from "./DigitalOrdersBoard";
import { ProductCardSkeleton } from "../../components/Skeleton";

type TabType = "pos" | "digital";

export default function Pos() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCheckoutMode = location.pathname.includes("/create-sale");

  const dispatch = useDispatch<AppDispatch>();
  const { addItem, items, total, discount, gstRate } = useCart();

  const { products, loading } = useSelector((state: RootState) => state.product);
  const { orders } = useSelector((state: RootState) => state.orders);
  const { categories: productCategories } = useSelector(
    (state: RootState) => state.productCategories
  );

  const activeCategorySlugs = useMemo(
    () => productCategories.filter((c) => c.isActive).map((c) => c.slug),
    [productCategories]
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<PriceSortOrder>("asc");
  const [activeTab, setActiveTab] = useState<TabType>("pos");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [ordersNewCount, setOrdersNewCount] = useState(0);
  const [newOrderToast, setNewOrderToast] = useState("");
  const [ordersSourceFilter, setOrdersSourceFilter] = useState<SourceFilter>("all");
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);

  const knownActiveOrderIdsRef = useRef<Set<string>>(new Set());
  const initializedOrdersRef = useRef(false);
  const toastTimeoutRef = useRef<number | null>(null);

  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["Pending", "Accepted", "Preparing", "Ready"].includes(order.status)
      ),
    [orders]
  );

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductCategories({ includeInactive: false }));
  }, [dispatch]);

  useEffect(() => {
    if (
      category !== "all" &&
      !activeCategorySlugs.includes(category)
    ) {
      setCategory("all");
    }
  }, [category, activeCategorySlugs]);

  const activeOrderPollParams = useMemo(
    () => ({
      status: "Pending,Accepted,Preparing,Ready",
      limit: 1000,
      silent: true,
    }),
    []
  );

  useEffect(() => {
    dispatch(fetchOrders(activeOrderPollParams));
    const interval = setInterval(() => {
      const mode = (window as any).ordersFilterMode;
      if (mode !== "completed" && mode !== "cancelled") {
        dispatch(fetchOrders(activeOrderPollParams));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [dispatch, activeOrderPollParams]);

  useEffect(() => {
    const latestIds = new Set(activeOrders.map((order) => order._id));

    if (!initializedOrdersRef.current) {
      knownActiveOrderIdsRef.current = latestIds;
      initializedOrdersRef.current = true;
      return;
    }

    let newOrders = 0;
    latestIds.forEach((id) => {
      if (!knownActiveOrderIdsRef.current.has(id)) {
        newOrders += 1;
      }
    });

    if (newOrders > 0) {
      if (activeTab !== "digital") {
        setOrdersNewCount((prev) => prev + newOrders);
      }

      setNewOrderToast(
        `${newOrders} new order${newOrders > 1 ? "s" : ""} received`
      );

      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = window.setTimeout(() => {
        setNewOrderToast("");
      }, 3500);
    }

    knownActiveOrderIdsRef.current = latestIds;
  }, [activeOrders, activeTab]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = products
      .filter((p: any) => p.isActive)
      .filter((p: any) => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
          category === "all" ? true : p.category === category;
        return matchesSearch && matchesCategory;
      });
    return sortByPrice(
      filtered,
      sortOrder,
      (p) => Number(p.sellingPrice) || 0
    );
  }, [products, search, category, sortOrder]);

  const getCartQty = (id: string) => {
    const item = items.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleBackdropClick = () => setIsCartOpen(false);

  const switchToTab = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "digital") {
      setOrdersNewCount(0);
      setNewOrderToast("");
    }
  };

  const handleOrderPlaced = (orderId: string) => {
    knownActiveOrderIdsRef.current.add(orderId);
    setOrdersSourceFilter("POS");
    setHighlightOrderId(orderId);
    switchToTab("digital");
  };

  return (
    <Flex
      direction="column"
      gap="4"
      style={{ height: "calc(100vh - 64px)", minHeight: 0, position: "relative" }}
    >
      {newOrderToast && (
        <div
          style={{
            position: "fixed",
            top: 86,
            right: 22,
            zIndex: 800,
            background: "#14532D",
            color: "white",
            border: "1px solid #22C55E",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Bell size={16} />
          {newOrderToast}
        </div>
      )}

      <Box
        style={{
          background: "var(--gray-2)",
          padding: 6,
          borderRadius: 12,
          border: "1px solid var(--gray-5)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Flex gap="2">
          <Box
            onClick={() => switchToTab("pos")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "center",
              fontWeight: 500,
              background: activeTab === "pos" ? "var(--accent-9)" : "transparent",
              color: activeTab === "pos" ? "white" : "var(--gray-12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Monitor size={18} strokeWidth={2.5} />
            Point of Sale
          </Box>
          <Box
            onClick={() => switchToTab("digital")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "center",
              fontWeight: 500,
              background: activeTab === "digital" ? "var(--accent-9)" : "transparent",
              color: activeTab === "digital" ? "white" : "var(--gray-12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <TabletSmartphone size={18} strokeWidth={2.5} />
            <span>Orders</span>
            {ordersNewCount > 0 && (
              <span
                style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 999,
                  background: "#EF4444",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "0 6px",
                }}
              >
                {ordersNewCount}
              </span>
            )}
          </Box>
        </Flex>
      </Box>

      {activeTab === "pos" && (
        <>
          <Flex gap="4" style={{ flex: 1, minHeight: 0 }} className="pos-desktop-layout">
            <Flex direction="column" gap="4" style={{ flex: 1 }}>
              <Flex gap="3" wrap="wrap" align="center">
                <Box style={{ flex: 1, minWidth: 160 }}>
                  <Searchbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    placeholder="Search products..."
                  />
                </Box>
                <Select.Root value={category} onValueChange={setCategory}>
                  <Select.Trigger style={{ width: 200 }} />
                  <Select.Content position="popper" sideOffset={8}>
                    <Select.Item value="all">All Categories</Select.Item>
                    {activeCategorySlugs.map((slug) => (
                      <Select.Item key={slug} value={slug}>
                        {categoryLabelForSlug(slug, productCategories)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <Flex gap="2" align="center">
                  <button
                    type="button"
                    onClick={() => setSortOrder("asc")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--gray-6)",
                      background: sortOrder === "asc" ? "var(--accent-9)" : "var(--gray-1)",
                      color: sortOrder === "asc" ? "white" : "var(--gray-12)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Low–High
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOrder("desc")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--gray-6)",
                      background: sortOrder === "desc" ? "var(--accent-9)" : "var(--gray-1)",
                      color: sortOrder === "desc" ? "white" : "var(--gray-12)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    High–Low
                  </button>
                </Flex>
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
                {loading && products.length === 0 ? (
                  <ProductCardSkeleton count={8} />
                ) : (
                  filteredProducts.map((product: any) => {
                    const cartQty = getCartQty(product._id);
                    const remainingStock = product.stockQty - cartQty;
                    return (
                      <ProductCard
                        key={product._id}
                        image={product.image?.url || product.image || undefined}
                        name={product.name}
                        sku={product.sku}
                        price={product.sellingPrice}
                        stock={remainingStock}
                        minStock={product.minStock}
                        category={product.category}
                        variant="pos"
                        onAdd={() => {
                          if (remainingStock <= 0) return;
                          addItem({
                            id: product._id,
                            name: product.name,
                            price: product.sellingPrice,
                            maxQty: product.stockQty,
                          });
                        }}
                      />
                    );
                  })
                )}
              </Box>
            </Flex>

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

          {totalItems > 0 && (
            <button
              className="pos-cart-fab"
              onClick={() => setIsCartOpen(true)}
              style={{
                position: "fixed",
                bottom: 24,
                right: 20,
                zIndex: 200,
                display: "none",
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

          <div
            className="pos-cart-backdrop"
            onClick={handleBackdropClick}
            style={{
              display: "none",
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 300,
              opacity: isCartOpen ? 1 : 0,
              pointerEvents: isCartOpen ? "auto" : "none",
              transition: "opacity 0.25s ease",
            }}
          />

          <div
            className="pos-cart-drawer"
            style={{
              display: "none",
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

            <button
              aria-label="Close cart drawer"
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

            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              <Cart onCheckout={() => setIsCartOpen(false)} />
            </div>
          </div>
        </>
      )}

      {activeTab === "digital" && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <DigitalOrdersBoard
            sourceFilter={ordersSourceFilter}
            onSourceFilterChange={setOrdersSourceFilter}
            highlightOrderId={highlightOrderId}
            onHighlightConsumed={() => setHighlightOrderId(null)}
          />
        </div>
      )}

      <CheckoutDialog
        open={isCheckoutMode}
        onClose={() => navigate("/dashboard/pos")}
        onOrderPlaced={handleOrderPlaced}
        discount={discount}
        gstRate={gstRate}
      />

      <style>{`
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
            padding-bottom: 100px !important;
          }
          .pos-desktop-layout {
            flex-direction: column !important;
          }
        }

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
