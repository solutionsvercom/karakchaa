import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { fetchOrders, loadMoreOrders, updateOrderStatus, resetOrders } from "../../features/OrdersSlice";
import { fetchSales } from "../../features/SalesSlice";
import { fetchCustomers } from "../../features/CustomersSlice";
import { fetchStockItems } from "../../features/StockmanagementSlice";
import { ArrowLeft } from "lucide-react";
import { PaymentMethodModal } from "../../components/PaymentMethodModal";
import { Toast, ToastProvider, ToastViewport } from "../../components/Toast";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

type PaymentMethod = "Cash" | "UPI" | "PhonePe" | "GPay" | "Paytm" | "Card" | "Other";

type FilterMode = "active" | "completed" | "cancelled" | "all";
export type SourceFilter = "all" | "POS" | "DIGITAL";

interface DigitalOrdersBoardProps {
  sourceFilter?: SourceFilter;
  onSourceFilterChange?: (filter: SourceFilter) => void;
  highlightOrderId?: string | null;
  onHighlightConsumed?: () => void;
}

export default function DigitalOrdersBoard({
  sourceFilter = "all",
  onSourceFilterChange,
  highlightOrderId,
  onHighlightConsumed,
}: DigitalOrdersBoardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { orders: allOrders, loading, loadingMore, pagination, updatingOrderId } =
    useSelector((state: RootState) => state.orders);
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

  //STAFF-LEVEL: Lazy loading with intersection observer
  const observerTarget = useRef<HTMLDivElement>(null);

  // Set window.ordersFilterMode whenever filterMode changes
  useEffect(() => {
    (window as any).ordersFilterMode = filterMode;
  }, [filterMode]);

  const buildFetchParams = useCallback(() => {
    let statusParams: string | undefined;

    if (filterMode === "active") {
      statusParams = "Pending,Accepted,Preparing,Ready";
    } else if (filterMode === "completed") {
      statusParams = "Completed";
    } else if (filterMode === "cancelled") {
      statusParams = "Cancelled";
    }

    return {
      ...(sourceFilter !== "all" && { orderSource: sourceFilter }),
      ...(statusParams && { status: statusParams }),
      limit: filterMode === "active" ? 1000 : 15,
    };
  }, [filterMode, sourceFilter]);

  // Fetch fresh data whenever filter mode or source filter changes
  useEffect(() => {
    dispatch(resetOrders());
    dispatch(fetchOrders(buildFetchParams()));
  }, [dispatch, buildFetchParams]);

  //STAFF-LEVEL: Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination?.hasMore && !loadingMore && filterMode !== "active") {
          let statusParams: string | undefined;
          if (filterMode === "completed") statusParams = "Completed";
          else if (filterMode === "cancelled") statusParams = "Cancelled";

          // Load next page
          dispatch(loadMoreOrders({
            page: pagination.page + 1,
            limit: 15,
            ...(sourceFilter !== "all" && { orderSource: sourceFilter }),
            ...(statusParams && { status: statusParams })
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
  }, [dispatch, pagination, loadingMore, sourceFilter]);

  const orders = useMemo(() => {
    if (filterMode === "active") {
      return allOrders.filter((order) =>
        ["Pending", "Accepted", "Preparing", "Ready"].includes(order.status)
      );
    } else if (filterMode === "completed") {
      return allOrders.filter((order) => order.status === "Completed");
    } else if (filterMode === "cancelled") {
      return allOrders.filter((order) => order.status === "Cancelled");
    }

    return allOrders;
  }, [allOrders, filterMode]);

  useEffect(() => {
    if (highlightOrderId && orders.some((o) => o._id === highlightOrderId)) {
      setSelectedOrderId(highlightOrderId);
      setMobileView("detail");
      onHighlightConsumed?.();
      return;
    }

    if (!orders.length) {
      setSelectedOrderId(null);
      return;
    }
    if (!selectedOrderId || !orders.some((o) => o._id === selectedOrderId)) {
      setSelectedOrderId(orders[0]._id);
    }
  }, [orders, selectedOrderId, highlightOrderId, onHighlightConsumed]);

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
      dispatch(fetchCustomers({ page: 1, limit: 100000 }));
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

      if (filterMode === "active") {
        dispatch(
          fetchOrders({
            ...buildFetchParams(),
            silent: true,
          })
        );
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      setToastMessage({
        title: "Update failed",
        description:
          (err as { message?: string })?.message ||
          "Could not update order. Please try again.",
      });
      setToastVariant("error");
      setToastOpen(true);
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
        description: `${orderNumber} Invoice generated successfully`,
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
    if (s === "completed") return { bg: "var(--green-4)", color: "var(--green-11)", border: "var(--green-7)" };
    if (s === "cancelled") return { bg: "var(--red-4)", color: "var(--red-11)", border: "var(--red-7)" };
    if (s === "ready") return { bg: "var(--amber-4)", color: "var(--amber-11)", border: "var(--amber-7)" };
    if (s === "preparing") return { bg: "var(--amber-3)", color: "var(--amber-11)", border: "var(--amber-6)" };
    if (s === "accepted") return { bg: "var(--blue-4)", color: "var(--blue-11)", border: "var(--blue-7)" };
    return { bg: "var(--accent-4)", color: "var(--accent-11)", border: "var(--accent-7)" };
  };

  const getActionButtonTheme = (status: string | null) => {
    switch ((status || "").toLowerCase()) {
      case "accepted":
        return {
          background: "var(--blue-9)",
          border: "1px solid var(--blue-8)",
          color: "white",
        };
      case "preparing":
        return {
          background: "var(--amber-9)",
          border: "1px solid var(--amber-8)",
          color: "white",
        };
      case "ready":
        return {
          background: "var(--green-9)",
          border: "1px solid var(--green-8)",
          color: "white",
        };
      case "completed":
        return {
          background: "var(--green-10)",
          border: "1px solid var(--green-8)",
          color: "white",
        };
      case "cancelled":
        return {
          background: "var(--red-9)",
          border: "1px solid var(--red-8)",
          color: "white",
        };
      default:
        return {
          background: "var(--accent-9)",
          border: "1px solid var(--accent-8)",
          color: "white",
        };
    }
  };

  const actionButtonTheme = getActionButtonTheme(nextStatus || statusLower);

  const getSourceBadge = (orderSource?: string) => {
    if (orderSource === "POS") {
      return { label: "POS", bg: "var(--blue-3)", color: "var(--blue-11)", border: "var(--blue-6)" };
    }
    return { label: "Digital", bg: "var(--purple-3)", color: "var(--purple-11)", border: "var(--purple-6)" };
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
        {/* ORDER LIST PANEL */}
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
              Orders ({orders.length})
            </h2>
            {loading && (
              <span style={{ color: "var(--gray-10)", fontSize: 12 }}>
                Refreshing...
              </span>
            )}
          </div>

          {/* Source filter */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 12,
              padding: 4,
              background: "var(--gray-2)",
              borderRadius: 8,
              border: "1px solid var(--gray-5)",
            }}
          >
            {([
              { value: "all" as SourceFilter, label: "All" },
              { value: "POS" as SourceFilter, label: "POS" },
              { value: "DIGITAL" as SourceFilter, label: "Digital" },
            ]).map((filter) => (
              <button
                key={filter.value}
                onClick={() => onSourceFilterChange?.(filter.value)}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  border: "none",
                  borderRadius: 6,
                  background: sourceFilter === filter.value ? "var(--gray-12)" : "transparent",
                  color: sourceFilter === filter.value ? "white" : "var(--gray-11)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {filter.label}
              </button>
            ))}
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
              // { value: "all" as FilterMode, label: "All" },
              { value: "cancelled" as FilterMode, label: "Cancelled" },
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
                No orders yet
              </p>
            )}
            {orders.map((order) => {
              const sourceBadge = getSourceBadge(order.orderSource);
              const isHighlighted = highlightOrderId === order._id;

              return (
              <div
                key={order._id}
                onClick={() => handleSelectOrder(order._id)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  cursor: "pointer",
                  background: isHighlighted ? "var(--accent-2)" : "var(--gray-2)",
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
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 6,
                        background: sourceBadge.bg,
                        color: sourceBadge.color,
                        border: `1px solid ${sourceBadge.border}`,
                        fontWeight: 700,
                      }}
                    >
                      {sourceBadge.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 8,
                        background: statusColor(order.status).bg,
                        color: statusColor(order.status).color,
                        border: `1px solid ${statusColor(order.status).border}`,
                        textTransform: "capitalize",
                        fontWeight: 600,
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
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
            );
            })}

            {/*STAFF-LEVEL: Lazy loading indicator */}
            {filterMode !== "active" && pagination?.hasMore && (
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

        {/* ORDER DETAIL PANEL */}
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
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: getSourceBadge(selectedOrder.orderSource).bg,
                      color: getSourceBadge(selectedOrder.orderSource).color,
                      border: `1px solid ${getSourceBadge(selectedOrder.orderSource).border}`,
                    }}
                  >
                    {getSourceBadge(selectedOrder.orderSource).label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: statusColor(selectedOrder.status).bg,
                      color: statusColor(selectedOrder.status).color,
                      border: `1px solid ${statusColor(selectedOrder.status).border}`,
                      textTransform: "capitalize",
                    }}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
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
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      color: "#B45309",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Special Instructions
                  </p>
                  <p style={{ margin: 0, color: "#92400E", fontSize: 13, fontWeight: 500 }}>
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
                  disabled={
                    !nextStatus ||
                    Boolean(isStatusLocked) ||
                    updatingOrderId === selectedOrderId
                  }
                  style={{
                    background: actionButtonTheme.background,
                    border: actionButtonTheme.border,
                    color: actionButtonTheme.color,
                    borderRadius: 10,
                    fontWeight: 600,
                    padding: "11px 12px",
                    cursor: "pointer",
                    opacity: !nextStatus || isStatusLocked ? 0.55 : 1,
                    fontSize: 15,
                    transition: "all 0.2s ease",
                    boxShadow: !nextStatus || isStatusLocked
                      ? "none"
                      : "0 10px 24px rgba(0,0,0,0.16)",
                  }}
                >
                  {nextStatusLabel}
                </button>
                <AlertDialog.Root>
                  <AlertDialog.Trigger asChild>
                    <button
                      disabled={isCancelDisabled}
                      style={{
                        background: "transparent",
                        border: "1px solid #EF4444",
                        color: "#EF4444",
                        borderRadius: 10,
                        fontWeight: 600,
                        padding: "11px 12px",
                        cursor: isCancelDisabled ? "not-allowed" : "pointer",
                        opacity: isCancelDisabled ? 0.5 : 1,
                        fontSize: 15,
                        transition: "all 0.2s ease"
                      }}
                    >
                      Cancel Order
                    </button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)", zIndex: 1000 }} />
                    <AlertDialog.Content style={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "white",
                      padding: "24px",
                      borderRadius: "16px",
                      width: "90%",
                      maxWidth: "400px",
                      zIndex: 1001,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                    }}>
                      <AlertDialog.Title style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                        Cancel Order
                      </AlertDialog.Title>
                      <AlertDialog.Description style={{ margin: "0 0 20px", fontSize: "15px", color: "#4B5563" }}>
                        Are you sure you want to cancel this order? This action cannot be undone.
                      </AlertDialog.Description>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <AlertDialog.Cancel asChild>
                          <button style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#F3F4F6",
                            color: "#374151",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "14px"
                          }}>
                            No, keep it
                          </button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <button 
                            onClick={() => changeStatus("Cancelled")}
                            style={{
                              padding: "10px 16px",
                              borderRadius: "8px",
                              border: "none",
                              background: "#EF4444",
                              color: "white",
                              fontWeight: 600,
                              cursor: "pointer",
                              fontSize: "14px"
                            }}
                          >
                            Yes, Cancel Order
                          </button>
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PAYMENT METHOD MODAL */}
      <PaymentMethodModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleCompleteWithPayment}
        loading={paymentLoading}
      />

      {/* TOAST NOTIFICATIONS */}
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
