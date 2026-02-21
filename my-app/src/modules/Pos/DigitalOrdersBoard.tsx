import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { fetchOrders, updateOrderStatus } from "../../features/OrdersSlice";
import { createSale } from "../../features/SalesSlice";

export default function DigitalOrdersBoard() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders: allOrders, loading } = useSelector((state: RootState) => state.orders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Filter to show only digital menu orders (orderType: 'online')
  const orders = useMemo(
    () => allOrders.filter((order) => order.orderType === "online"),
    [allOrders]
  );

  useEffect(() => {
    dispatch(fetchOrders());
    const interval = setInterval(() => {
      dispatch(fetchOrders());
    }, 10000);
    return () => clearInterval(interval);
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
  const isLocked =
    selectedOrder &&
    ["completed", "cancelled"].includes(String(selectedOrder.status).toLowerCase());

  const changeStatus = (status: "Ready" | "Cancelled" | "Completed") => {
  if (!selectedOrderId) return;
  dispatch(updateOrderStatus({ id: selectedOrderId, status }));
};

  const handleCompleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      for (const item of selectedOrder.items) {
        const rawProduct = (item as any).product;
        const productId =
          typeof rawProduct === "string" ? rawProduct : rawProduct?._id;
        if (!productId) continue;

        await dispatch(
          createSale({
            productId,
            quantity: item.quantity,
            paymentMethod: "Cash",
            paymentStatus: "Completed",
          })
        ).unwrap();
      }

      await dispatch(
        updateOrderStatus({ id: selectedOrder._id, status: "Completed" })
      ).unwrap();
      dispatch(fetchOrders());
    } catch (error) {
      console.error("Failed to complete order:", error);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        gap: 16,
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
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
            <span style={{ color: "var(--gray-10)", fontSize: 12 }}>Refreshing...</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() => setSelectedOrderId(order._id)}
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
                    background: "var(--accent-9)",
                    color: "var(--accent-contrast)",
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

      <div
        style={{
          borderRadius: 14,
          background: "var(--gray-1)",
          border: "1px solid var(--gray-6)",
          padding: 18,
          overflowY: "auto",
        }}
      >
        {!selectedOrder && (
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
        )}

        {selectedOrder && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                <p style={{ margin: "6px 0 0 0", color: "var(--gray-10)", fontSize: 13 }}>
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                style={{
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "var(--accent-9)",
                  color: "var(--accent-contrast)",
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
                onClick={() => changeStatus("Ready")}
                disabled={Boolean(isLocked)}
                style={{
                  background: "#22C55E",
                  border: "none",
                  color: "white",
                  borderRadius: 10,
                  fontWeight: 600,
                  padding: "11px 12px",
                  cursor: "pointer",
                  opacity: isLocked ? 0.55 : 1,
                }}
              >
                Mark Ready
              </button>
              <button
                onClick={handleCompleteOrder}
                disabled={Boolean(isLocked)}
                style={{
                  background: "var(--accent-9)",
                  border: "none",
                  color: "var(--accent-contrast)",
                  borderRadius: 10,
                  fontWeight: 600,
                  padding: "11px 12px",
                  cursor: "pointer",
                  opacity: isLocked ? 0.55 : 1,
                }}
              >
                Complete and Push to Sales
              </button>
              <button
                onClick={() => changeStatus("Cancelled")}
                disabled={Boolean(isLocked)}
                style={{
                  background: "transparent",
                  border: "1px solid #EF4444",
                  color: "#FCA5A5",
                  borderRadius: 10,
                  fontWeight: 600,
                  padding: "11px 12px",
                  cursor: "pointer",
                  opacity: isLocked ? 0.55 : 1,
                }}
              >
                Cancel Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
