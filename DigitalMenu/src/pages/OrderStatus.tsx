import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clock3,
  CheckCircle2,
  Loader2,
  Home,
  Lightbulb,
  BellRing,
} from "lucide-react";
import { useAppDispatch } from "../store/hooks";
import { fetchOrderStatus } from "../features/DigitalOrderSlice";
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
  backendOrderId?: string;
};

// Tracks which "terminal" UI state we're in (beyond the 4-step timeline)
type TerminalStatus = "none" | "ready" | "completed";

export default function OrderStatusPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderState | null;

  const [stepIndex, setStepIndex] = useState(0);
  const [terminalStatus, setTerminalStatus] = useState<TerminalStatus>("none");
  const [liveOrderNumber, setLiveOrderNumber] = useState<string>("");

  // Map backend status → timeline step index
  const statusToStepIndex = (status: string): number => {
    const statusMap: { [key: string]: number } = {
      pending: 0,
      accepted: 1,
      preparing: 2,
      ready: 3,
      completed: 3,
      cancelled: 0,
    };
    return statusMap[status.toLowerCase()] ?? 0;
  };

  // Poll backend every 3 seconds
  useEffect(() => {
    if (!state?.backendOrderId) return;

    const pollStatus = async () => {
      try {
        const result = await dispatch(
          fetchOrderStatus(state.backendOrderId!)
        ).unwrap();

        const status = result.status.toLowerCase();
        if (result.orderNumber) {
          setLiveOrderNumber(result.orderNumber);
        }
        setStepIndex(statusToStepIndex(status));

        if (status === "cancelled") {
          // Navigate immediately to cancellation page
          navigate("/order-cancelled", { state });
          return;
        }

        if (status === "ready") {
          // Show inline "ready" banner — do NOT navigate yet
          setTerminalStatus("ready");
          return;
        }

        if (status === "completed") {
          // Staff has marked it completed in my-app after payment
          setTerminalStatus("completed");
          setTimeout(() => {
            navigate("/order-completed", { state });
          }, 1500);
        }
      } catch (error) {
        console.error("Failed to fetch order status:", error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [state?.backendOrderId, dispatch, navigate, state]);

  // Redirect if arrived here with no state (e.g. direct URL access)
  useEffect(() => {
    if (!state) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state) return null;

  const { orderNumber, items, subtotal, tax, discount, gstRate, total } = state;
  const displayOrderNumber = liveOrderNumber || orderNumber;
  const isReady = terminalStatus === "ready";

  const statusColorMap: Record<string, { bg: string, color: string, border: string }> = {
    pending: { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
    accepted: { bg: "#DBEAFE", color: "#1D4ED8", border: "#BFDBFE" },
    preparing: { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
    ready: { bg: "#DCFCE7", color: "#15803D", border: "#BBF7D0" },
    completed: { bg: "#DCFCE7", color: "#15803D", border: "#BBF7D0" },
    cancelled: { bg: "#FEE2E2", color: "#B91C1C", border: "#FECACA" },
  };

  const statusLower = liveOrderNumber ? Object.keys(statusColorMap)[stepIndex] || "pending" : "pending";
  // We infer the status from the stepIndex logic if needed, but since we don't store raw status, we'll map backwards
  let displayStatus = "Pending";
  if (stepIndex === 1) displayStatus = "Accepted";
  if (stepIndex === 2) displayStatus = "Preparing";
  if (isReady || stepIndex === 3) displayStatus = "Ready";

  const badgeTheme = statusColorMap[displayStatus.toLowerCase()] || statusColorMap.pending;

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
            background: "linear-gradient(90deg, #7c3aed, #4f46e5)"
          }} />
          <h2 style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 8px 0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px" }}>
            Order Number
          </h2>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "#111827", margin: "0 0 16px 0", letterSpacing: "-1px" }}>
            #{displayOrderNumber}
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <span style={{
              background: badgeTheme.bg,
              color: badgeTheme.color,
              border: `1px solid ${badgeTheme.border}`,
              padding: "6px 16px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}>
              {isReady && <BellRing size={16} />}
              {displayStatus}
            </span>
          </div>
        </div>

        {isReady && (
          <div style={{
            background: "linear-gradient(135deg, #22C55E, #16A34A)",
            borderRadius: "20px",
            padding: "20px",
            color: "white",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(34, 197, 94, 0.25)",
            animation: "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <BellRing size={32} style={{ marginBottom: "12px" }} />
            <h3 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: 700 }}>Order is Ready!</h3>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>Head to the counter to collect your order.</p>
          </div>
        )}

        {/* Timeline */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#111827", fontWeight: 700 }}>Track Order</h3>
          <div className="status-timeline">
            {/* Step 0 */}
            <div className={`status-step ${stepIndex >= 0 ? "active" : ""}`}>
              <div className={`status-icon-wrapper ${stepIndex === 0 ? "active" : stepIndex > 0 ? "completed" : ""}`}>
                <Clock3 size={12} className="status-icon" />
              </div>
              <div className="status-text">
                <p className="status-title" style={{ fontWeight: 600 }}>Order Placed</p>
                {stepIndex === 0 && <p className="status-subtitle" style={{ color: "#7c3aed" }}>Confirmed and waiting</p>}
              </div>
            </div>
            <div className="status-connector" />

            {/* Step 1 */}
            <div className={`status-step ${stepIndex >= 1 ? "active" : ""}`}>
              <div className={`status-icon-wrapper ${stepIndex === 1 ? "active" : stepIndex > 1 ? "completed" : ""}`}>
                <CheckCircle2 size={12} className="status-icon" />
              </div>
              <div className="status-text">
                <p className={`status-title ${stepIndex >= 1 ? "" : "muted"}`} style={{ fontWeight: stepIndex >= 1 ? 600 : 400 }}>Accepted</p>
              </div>
            </div>
            <div className="status-connector" />

            {/* Step 2 */}
            <div className={`status-step ${stepIndex >= 2 ? "active" : ""}`}>
              <div className={`status-icon-wrapper ${stepIndex === 2 ? "active" : stepIndex > 2 ? "completed" : ""}`}>
                <Loader2 size={12} className={`status-icon ${stepIndex === 2 ? 'spin' : ''}`} />
              </div>
              <div className="status-text">
                <p className={`status-title ${stepIndex >= 2 ? "" : "muted"}`} style={{ fontWeight: stepIndex >= 2 ? 600 : 400 }}>Preparing</p>
              </div>
            </div>
            <div className="status-connector" />

            {/* Step 3 */}
            <div className={`status-step ${stepIndex >= 3 ? "active" : ""}`}>
              <div className={`status-icon-wrapper ${stepIndex >= 3 ? "active" : ""}`}>
                <CheckCircle2 size={12} className="status-icon" />
              </div>
              <div className="status-text">
                <p className={`status-title ${stepIndex >= 3 ? "" : "muted"}`} style={{ fontWeight: stepIndex >= 3 ? 600 : 400 }}>Ready</p>
              </div>
            </div>
          </div>
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
      <style>
        {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
          .spin { animation: spin 2s linear infinite; }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .status-step { display: flex; align-items: center; gap: 12px; margin: 4px 0; }
          .status-icon-wrapper { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #E5E7EB; display: flex; align-items: center; justify-content: center; background: white; z-index: 2; transition: all 0.3s ease; }
          .status-icon-wrapper.active { border-color: #7c3aed; background: #ede9fe; color: #7c3aed; transform: scale(1.3); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25); }
          .status-icon-wrapper.completed { border-color: #10B981; background: #D1FAE5; color: #10B981; }
          .status-icon { color: inherit; }
          .status-icon-wrapper:not(.active):not(.completed) .status-icon { color: #9CA3AF; }
          .status-connector { height: 16px; border-left: 2px solid #E5E7EB; margin-left: 13px; z-index: 1; }
          .status-title { margin: 0; font-size: 14px; color: #111827; }
          .status-title.muted { color: #9CA3AF; }
          .status-subtitle { margin: 4px 0 0 0; font-size: 12px; }
        `}
      </style>
    </div>
  );
}
