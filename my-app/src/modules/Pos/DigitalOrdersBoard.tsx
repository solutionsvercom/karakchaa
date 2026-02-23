import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { fetchOrders, updateOrderStatus } from "../../features/OrdersSlice";
import { ArrowLeft } from "lucide-react";

export default function DigitalOrdersBoard() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders: allOrders, loading } = useSelector((state: RootState) => state.orders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // Filter to show only digital menu orders (orderType: 'online')
  const orders = useMemo(
    () => allOrders.filter((order) => order.orderType === "online"),
    [allOrders]
  );

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // ... rest of the component stays the same

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

  const changeStatus = (
    status: "Accepted" | "Preparing" | "Ready" | "Cancelled" | "Completed"
  ) => {
  if (!selectedOrderId) return;
  dispatch(updateOrderStatus({ id: selectedOrderId, status }));
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
    <>
      <style>{`
        .dob-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 16px;
          height: 100%;
          min-height: 0;
        }

        /* Mobile: show only one panel at a time */
        @media (max-width: 767px) {
          .dob-grid {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
          }
          .dob-list-panel {
            display: block;
          }
          .dob-detail-panel {
            display: block;
          }
          /* Hide/show panels based on mobile view state */
          .dob-grid[data-view="list"] .dob-detail-panel {
            display: none;
          }
          .dob-grid[data-view="detail"] .dob-list-panel {
            display: none;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .dob-grid {
            grid-template-columns: 280px 1fr;
          }
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
            <h2 style={{ color: "var(--gray-12)", fontSize: 18, fontWeight: 700, margin: 0 }}>
              Incoming Orders ({orders.length})
            </h2>
            {loading && (
              <span style={{ color: "var(--gray-10)", fontSize: 12 }}>Refreshing...</span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                  <p style={{ margin: 0, color: "var(--gray-12)", fontWeight: 600, fontSize: 15 }}>
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
                <p style={{ margin: "0 0 6px 0", color: "var(--gray-10)", fontSize: 13 }}>
                  {order.customerName || "Walk-in"}
                </p>
                <p style={{ margin: 0, color: "var(--accent-10)", fontSize: 14, fontWeight: 600 }}>
                  Rs {order.totalAmount}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ORDER DETAIL PANEL ===== */}
        <div
          className="dob-detail-panel"
          style={{
            borderRadius: 14,
            background: "var(--gray-1)",
            border: "1px solid var(--gray-6)",
            padding: 18,
            overflowY: "auto",
          }}
        >
          {!selectedOrder ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--gray-10)",
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
                  .dob-back-btn {
                    display: flex !important;
                  }
                }
              `}</style>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: "var(--gray-12)", fontSize: 24, fontWeight: 700 }}>
                    {selectedOrder.orderNumber}
                  </h3>
                  <p style={{ margin: "6px 0 0 0", color: "var(--gray-10)", fontSize: 13 }}>
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

              <div
                style={{
                  background: "var(--gray-2)",
                  borderRadius: 10,
                  padding: 12,
                  border: "1px solid var(--gray-6)",
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "var(--gray-11)", fontWeight: 600 }}>
                  Customer Details
                </p>
                <p style={{ margin: "0 0 4px 0", color: "var(--gray-12)" }}>
                  {selectedOrder.customerName || "Walk-in"}
                </p>
                <p style={{ margin: "0 0 4px 0", color: "var(--gray-10)", fontSize: 14 }}>
                  {selectedOrder.phone || "-"}
                </p>
                <p style={{ margin: 0, color: "var(--gray-10)", fontSize: 14 }}>
                  Order Type: {selectedOrder.orderType}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 10px 0", color: "var(--gray-11)", fontWeight: 600 }}>
                  Order Items
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                        {(item as any).product?.name || item.name} x {item.quantity}
                      </span>
                      <span>Rs {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div
                  style={{
                    background: "rgba(180, 83, 9, 0.2)",
                    border: "1px solid #D97706",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <p style={{ margin: "0 0 6px 0", color: "#FBBF24", fontWeight: 600, fontSize: 13 }}>
                    Special Instructions
                  </p>
                  <p style={{ margin: 0, color: "#FDE68A", fontSize: 13 }}>
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--gray-12)",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                <span>Subtotal</span>
                <span>Rs {selectedOrder.totalAmount}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => nextStatus && changeStatus(nextStatus as "Accepted" | "Preparing" | "Ready" | "Completed")}
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
    </>
  );
}
