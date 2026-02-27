import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { fetchOrders, loadMoreOrders, updateOrderStatus } from "../../features/OrdersSlice";
import { fetchSales } from "../../features/SalesSlice";
import { fetchCustomers } from "../../features/CustomersSlice";
import { fetchStockItems } from "../../features/StockmanagementSlice";
import { ArrowLeft } from "lucide-react";
import { PaymentMethodModal } from "../../components/PaymentMethodModal";
import { Toast, ToastProvider, ToastViewport } from "../../components/Toast";

type PaymentMethod = "Cash" | "UPI" | "PhonePe" | "GPay" | "Paytm" | "Card" | "Other";

type FilterMode = "active" | "completed" | "cancelled" | "all";


export default function DigitalOrdersBoard() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders: allOrders, loading, loadingMore, pagination } = useSelector(
    (state: RootState) => state.orders
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", description: "" });
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "info">("success");
  
  // Filter state
  const [filterMode, setFilterMode] = useState<FilterMode>("active");

  // ✅ STAFF-LEVEL: Lazy loading with intersection observer
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter to show only digital menu orders (orderType: 'online' OR orderSource: 'DIGITAL')
  // Then apply active/completed/all filter
  const orders = useMemo(() => {
    const onlineOrders = allOrders.filter((order) => 
      order.orderType === "online" || order.orderSource === "DIGITAL"
    );
    
    if (filterMode === "active") {
      return onlineOrders.filter((order) => 
        ["Pending", "Accepted", "Preparing", "Ready"].includes(order.status)
      );
    } else if (filterMode === "completed") {
      return onlineOrders.filter((order) => 
        ["Completed", "Cancelled"].includes(order.status)
      );
    }
    
    return onlineOrders; // "all"
  }, [allOrders, filterMode]);

  // Initial fetch
  useEffect(() => {
    dispatch(fetchOrders({ 
      orderSource: "DIGITAL", // ✅ NEW: Filter by source
      limit: 20 // Staff-level: reasonable initial load
    }));
  }, [dispatch]);

  // ✅ STAFF-LEVEL: Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination?.hasMore && !loadingMore) {
          // Load next page
          dispatch(loadMoreOrders({
            page: pagination.page + 1,
            limit: 20,
            orderSource: "DIGITAL",
          }));
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [dispatch, pagination, loadingMore]);

  useEffect(() => {
    if (!orders.length) {
      setSelectedOrderId(null);
      return;
    }
    if (!selectedOrderId || !orders.some((o) => o._id === selectedOrderId)) {
      setSelectedOrderId(orders[0]._id);
    }
  }, [orders, selectedOrderId]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o._id === selectedOrderId),
    [orders, selectedOrderId]
  );

  const statusLower = String(selectedOrder?.status || "").toLowerCase();
  const isStatusLocked = ["completed", "cancelled"].includes(statusLower);
  const isCancelDisabled =
    statusLower === "cancelled" || statusLower === "completed";

  const refreshRelatedData = async (newStatus: string) => {
    dispatch(fetchStockItems());
    dispatch(fetchSales());

    if (newStatus === "Completed" || newStatus === "Cancelled") {
      dispatch(fetchCustomers());
    }
  };

  const changeStatus = async (
    status: "Accepted" | "Preparing" | "Ready" | "Cancelled" | "Completed",
    paymentMethod?: PaymentMethod
  ) => {
    if (!selectedOrderId) return;

    try {
      await dispatch(
        updateOrderStatus({ 
          id: selectedOrderId, 
          status,
          ...(paymentMethod && { paymentMethod })
        })
      ).unwrap();

      await refreshRelatedData(status);
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleCompleteWithPayment = async (paymentMethod: PaymentMethod) => {
    setPaymentLoading(true);
    try {
      const orderNumber = orders.find(o => o._id === selectedOrderId)?.orderNumber;
      
      await changeStatus("Completed", paymentMethod);
      setShowPaymentModal(false);
      
      setToastMessage({
        title: "Order Completed!",
        description: `${orderNumber} - Invoice generated successfully`,
      });
      setToastVariant("success");
      setToastOpen(true);
    } catch (err) {
      console.error("Failed to complete order:", err);
      
      setToastMessage({
        title: "Error",
        description: "Failed to complete order. Please try again.",
      });
      setToastVariant("error");
      setToastOpen(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleMarkAsCompleted = () => {
    setShowPaymentModal(true);
  };

  const getNextStatus = (status: string) => {
    if (status === "pending") return "Accepted";
    if (status === "accepted") return "Preparing";
    if (status === "preparing") return "Ready";
    if (status === "ready") return "Completed";
    return null;
  };

  const getNextStatusLabel = (status: string) => {
    if (status === "pending") return "Mark as Accepted";
    if (status === "accepted") return "Mark as Preparing";
    if (status === "preparing") return "Mark as Ready";
    if (status === "ready") return "Mark as Completed";
    if (status === "completed") return "Order Completed";
    if (status === "cancelled") return "Order Cancelled";
    return "Update Status";
  };

  const nextStatus = getNextStatus(statusLower);
  const nextStatusLabel = getNextStatusLabel(statusLower);

  const handleSelectOrder = (id: string) => {
    setSelectedOrderId(id);
    setMobileView("detail");
  };

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed") return "#22C55E";
    if (s === "cancelled") return "#EF4444";
    if (s === "ready") return "#F59E0B";
    return "var(--accent-9)";
  };

  return (
    <ToastProvider>
      <style>{`
        .dob-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 16px;
          height: 100%;
          min-height: 0;
        }

        @media (max-width: 767px) {
          .dob-grid {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
          }
          .dob-list-panel { display: block; }
          .dob-detail-panel { display: block; }
          .dob-grid[data-view="list"] .dob-detail-panel { display: none; }
          .dob-grid[data-view="detail"] .dob-list-panel { display: none; }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .dob-grid { grid-template-columns: 280px 1fr; }
        }
      `}</style>

      <div className="dob-grid" data-view={mobileView}>
        {/* ===== ORDER LIST PANEL ===== */}
        <div
          className="dob-list-panel"
          style={{
            borderRadius: 14,
            background: "var(--gray-1)",
            border: "1px solid var(--gray-6)",
            padding: 14,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                color: "var(--gray-12)",
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Incoming Orders ({orders.length})
            </h2>
            {loading && (
              <span style={{ color: "var(--gray-10)", fontSize: 12 }}>
                Refreshing...
              </span>
            )}
          </div>

          {/* Filter tabs */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 12,
              padding: 4,
              background: "var(--gray-3)",
              borderRadius: 8,
            }}
          >
            {[
              { value: "active" as FilterMode, label: "Active" },
              { value: "completed" as FilterMode, label: "Completed" },
              { value: "all" as FilterMode, label: "All" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterMode(filter.value)}
                style={{
                  flex: 1,
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 6,
                  background: filterMode === filter.value ? "var(--accent-9)" : "transparent",
                  color: filterMode === filter.value ? "white" : "var(--gray-11)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.length === 0 && (
              <p
                style={{
                  color: "var(--gray-10)",
                  textAlign: "center",
                  marginTop: 40,
                  fontSize: 14,
                }}
              >
                No online orders yet
              </p>
            )}
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => handleSelectOrder(order._id)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  cursor: "pointer",
                  background: "var(--gray-2)",
                  border:
                    selectedOrderId === order._id
                      ? "1px solid var(--accent-9)"
                      : "1px solid var(--gray-6)",
                  boxShadow:
                    selectedOrderId === order._id
                      ? "0 0 0 1px rgba(139, 92, 246, 0.25)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "var(--gray-12)",
                      fontWeight: 600,
                      fontSize: 15,
                    }}
                  >
                    {order.orderNumber}
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 8,
                      background: statusColor(order.status),
                      color: "white",
                      textTransform: "capitalize",
                    }}
                  >
                    {order.status}
                  </span>
                </div>
                <p
                  style={{
                    margin: "0 0 6px 0",
                    color: "var(--gray-10)",
                    fontSize: 13,
                  }}
                >
                  {order.customerName || "Walk-in"} · {order.items.length} item(s)
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--gray-12)",
                    }}
                  >
                    ₹{order.totalAmount}
                  </span>
                  <span style={{ color: "var(--gray-9)", fontSize: 11 }}>
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}

            {/* ✅ STAFF-LEVEL: Lazy loading indicator */}
            {pagination?.hasMore && (
              <div
                ref={observerTarget}
                style={{
                  padding: 16,
                  textAlign: "center",
                  color: "var(--gray-10)",
                  fontSize: 13,
                }}
              >
                {loadingMore ? "Loading more..." : "Scroll for more"}
              </div>
            )}
          </div>
        </div>

        {/* ===== ORDER DETAIL PANEL ===== */}
        <div
          className="dob-detail-panel"
          style={{
            borderRadius: 14,
            background: "var(--gray-1)",
            border: "1px solid var(--gray-6)",
            padding: 20,
            overflowY: "auto",
          }}
        >
          {!selectedOrder ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--gray-10)",
                fontSize: 14,
              }}
            >
              Select an order to view details
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Mobile back button */}
              <button
                className="dob-back-btn"
                onClick={() => setMobileView("list")}
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--gray-3)",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 14,
                  color: "var(--gray-11)",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                <ArrowLeft size={16} />
                Back to Orders
              </button>

              <style>{`
                @media (max-width: 767px) {
                  .dob-back-btn { display: flex !important; }
                }
              `}</style>

              {/* Order header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: "var(--gray-12)",
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {selectedOrder.orderNumber}
                  </h3>
                  <p
                    style={{
                      margin: "6px 0 0 0",
                      color: "var(--gray-10)",
                      fontSize: 13,
                    }}
                  >
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: statusColor(selectedOrder.status),
                    color: "white",
                    textTransform: "capitalize",
                  }}
                >
                  {selectedOrder.status}
                </span>
              </div>

              {/* Customer details */}
              <div
                style={{
                  background: "var(--gray-2)",
                  borderRadius: 10,
                  padding: 12,
                  border: "1px solid var(--gray-6)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px 0",
                    color: "var(--gray-11)",
                    fontWeight: 600,
                  }}
                >
                  Customer Details
                </p>
                <p style={{ margin: "0 0 4px 0", color: "var(--gray-12)" }}>
                  {selectedOrder.customerName || "Walk-in"}
                </p>
                <p
                  style={{
                    margin: "0 0 4px 0",
                    color: "var(--gray-10)",
                    fontSize: 14,
                  }}
                >
                  {selectedOrder.phone || "-"}
                </p>
                <p style={{ margin: 0, color: "var(--gray-10)", fontSize: 14 }}>
                  Order Type: {selectedOrder.orderType}
                </p>
              </div>

              {/* Order items */}
              <div>
                <p
                  style={{
                    margin: "0 0 10px 0",
                    color: "var(--gray-11)",
                    fontWeight: 600,
                  }}
                >
                  Order Items
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={`${item.product}-${idx}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "var(--gray-12)",
                      }}
                    >
                      <span>
                        {(item as any).product?.name || item.name} × {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div
                  style={{
                    background: "rgba(180, 83, 9, 0.2)",
                    border: "1px solid #D97706",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      color: "#FBBF24",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Special Instructions
                  </p>
                  <p style={{ margin: 0, color: "#FDE68A", fontSize: 13 }}>
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--gray-12)",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                <span>Total</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>

              {/* Action buttons */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <button
                  onClick={() => {
                    if (nextStatus === "Completed") {
                      handleMarkAsCompleted();
                    } else {
                      nextStatus &&
                        changeStatus(
                          nextStatus as
                            | "Accepted"
                            | "Preparing"
                            | "Ready"
                        );
                    }
                  }}
                  disabled={!nextStatus || Boolean(isStatusLocked)}
                  style={{
                    background: "#2563EB",
                    border: "none",
                    color: "white",
                    borderRadius: 10,
                    fontWeight: 600,
                    padding: "11px 12px",
                    cursor: "pointer",
                    opacity: !nextStatus || isStatusLocked ? 0.55 : 1,
                    fontSize: 15,
                  }}
                >
                  {nextStatusLabel}
                </button>
                <button
                  onClick={() => changeStatus("Cancelled")}
                  disabled={isCancelDisabled}
                  style={{
                    background: "transparent",
                    border: "1px solid #EF4444",
                    color: "#FCA5A5",
                    borderRadius: 10,
                    fontWeight: 600,
                    padding: "11px 12px",
                    cursor: "pointer",
                    opacity: isCancelDisabled ? 0.55 : 1,
                    fontSize: 15,
                  }}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== PAYMENT METHOD MODAL ===== */}
      <PaymentMethodModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleCompleteWithPayment}
        loading={paymentLoading}
      />

      {/* ===== TOAST NOTIFICATIONS ===== */}
      <Toast
        open={toastOpen}
        onOpenChange={setToastOpen}
        title={toastMessage.title}
        description={toastMessage.description}
        variant={toastVariant}
      />
      <ToastViewport />
    </ToastProvider>
  );
}
