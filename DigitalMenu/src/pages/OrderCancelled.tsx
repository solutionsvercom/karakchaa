import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { XCircle, Home, Lightbulb } from "lucide-react";
import "../App.css";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type OrderState = {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  gstRate: number;
  total: number;
};

export default function OrderCancelledPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderState | null;

  // Redirect if someone lands here directly with no state
  useEffect(() => {
    if (!state) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state) return null;

  const { orderNumber, items, subtotal, tax, discount, gstRate, total } = state;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAFAFA",
      padding: "20px 16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "480px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        
        {/* Header Card */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, height: "4px",
            background: "linear-gradient(90deg, #ef4444, #b91c1c)"
          }} />
          <h2 style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 8px 0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px" }}>
            Order Number
          </h2>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "#111827", margin: "0 0 16px 0", letterSpacing: "-1px" }}>
            #{orderNumber}
          </div>
        </div>

        {/* Cancelled Banner */}
        <div style={{
          background: "linear-gradient(135deg, #EF4444, #B91C1C)",
          borderRadius: "20px",
          padding: "20px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(239, 68, 68, 0.25)"
        }}>
          <XCircle size={36} style={{ marginBottom: "12px" }} />
          <h3 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: 700 }}>Order Cancelled</h3>
          <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>Your order has been cancelled. Please visit the counter for assistance.</p>
        </div>

        {/* Order Details */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#111827", fontWeight: 700 }}>Order Items</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                <span>{item.qty} × {item.name}</span>
                <span style={{ fontWeight: 600 }}>₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px dashed #E5E7EB", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6B7280" }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {(discount > 0 || discount !== undefined) && discount > 0 ? (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#10B981" }}>
                <span>Discount</span>
                <span>- ₹{discount}</span>
              </div>
            ) : null}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6B7280" }}>
              <span>GST ({gstRate || 0}%)</span>
              <span>₹{tax}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, color: "#111827", marginTop: "8px" }}>
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div style={{
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: "16px",
          padding: "16px",
          display: "flex",
          gap: "12px"
        }}>
          <Lightbulb size={20} color="#EF4444" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: "13px", color: "#991B1B", lineHeight: 1.5 }}>
            If you think this was a mistake, please speak to a staff member at the counter.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white",
            border: "none",
            borderRadius: "16px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(124, 58, 237, 0.25)",
            marginTop: "8px"
          }}
        >
          <Home size={20} />
          Order More
        </button>

      </div>
    </div>
  );
}
