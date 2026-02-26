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

  const { orderNumber, items, subtotal, tax, total } = state;
  const displayOrderNumber = liveOrderNumber || orderNumber;
  const isReady = terminalStatus === "ready";

  return (
    <div className="order-page">
      <div className="order-shell">

        {/* ── HEADER ── */}
        <header className={`order-header ${isReady ? "ready-header" : ""}`}>
          <p className="order-label">Order Number</p>
          <p className="order-code">#{displayOrderNumber}</p>
        </header>

        {/* ── READY BANNER (shown inline when status = ready) ── */}
        {isReady && (
          <section className="order-complete-hero order-ready-hero">
            <div className="order-complete-icon-wrap order-ready-icon-wrap">
              <BellRing className="order-complete-icon order-ready-icon" />
            </div>
            <h2 className="order-complete-title order-ready-title">
              Your Order is Ready!
            </h2>
            <p className="order-complete-subtitle">
              Please pay and collect your order from the counter.
            </p>
          </section>
        )}

        {/* ── STATUS TIMELINE ── */}
        <section className="order-card status-card">
          <h2 className="card-title">Order Status</h2>

          <div className="status-timeline">
            {/* Step 0 — Order Placed */}
            <div className={`status-step ${stepIndex >= 0 ? "active" : ""}`}>
              <div
                className={`status-icon-wrapper ${
                  stepIndex === 0 ? "active" : stepIndex > 0 ? "completed" : ""
                }`}
              >
                <Clock3 className="status-icon" />
              </div>
              <div className="status-text">
                <p className="status-title">Order Placed</p>
                {stepIndex === 0 && (
                  <p className="status-subtitle">In progress...</p>
                )}
              </div>
            </div>

            <div className="status-connector" />

            {/* Step 1 — Confirmed */}
            <div className={`status-step ${stepIndex >= 1 ? "active" : ""}`}>
              <div
                className={`status-icon-wrapper ${
                  stepIndex === 1 ? "active" : stepIndex > 1 ? "completed" : ""
                }`}
              >
                <CheckCircle2 className="status-icon" />
              </div>
              <div className="status-text">
                <p className={`status-title ${stepIndex >= 1 ? "" : "muted"}`}>
                  Confirmed
                </p>
              </div>
            </div>

            <div className="status-connector" />

            {/* Step 2 — Preparing */}
            <div className={`status-step ${stepIndex >= 2 ? "active" : ""}`}>
              <div
                className={`status-icon-wrapper ${
                  stepIndex === 2 ? "active" : stepIndex > 2 ? "completed" : ""
                }`}
              >
                <Loader2 className="status-icon" />
              </div>
              <div className="status-text">
                <p className={`status-title ${stepIndex >= 2 ? "" : "muted"}`}>
                  Preparing
                </p>
              </div>
            </div>

            <div className="status-connector" />

            {/* Step 3 — Ready */}
            <div className={`status-step ${stepIndex >= 3 ? "active" : ""}`}>
              <div
                className={`status-icon-wrapper ${
                  stepIndex >= 3 ? (isReady ? "active ready-pulse" : "completed") : ""
                }`}
              >
                <CheckCircle2 className="status-icon" />
              </div>
              <div className="status-text">
                <p className={`status-title ${stepIndex >= 3 ? "" : "muted"}`}>
                  Ready
                </p>
                {isReady && (
                  <p className="status-subtitle ready-subtitle">
                    Collect from counter!
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── ORDER DETAILS ── */}
        <section className="order-card details-card">
          <h2 className="card-title">Order Details</h2>

          <div className="order-items">
            {items.map((item) => (
              <div key={item.id} className="order-row order-item-row">
                <span className="order-item-name">
                  {item.name} × {item.qty}
                </span>
                <span className="order-item-price">
                  ₹{item.price * item.qty}
                </span>
              </div>
            ))}
          </div>

          <div className="order-total">
            <div className="order-row order-total-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="order-row order-total-row">
              <span>GST (5%)</span>
              <span>+ ₹{tax}</span>
            </div>
            <div className="order-row order-total-row order-total-main">
              <span>Total</span>
              <span className="order-total-main-value">₹{total}</span>
            </div>
          </div>
        </section>

        {/* ── NOTE ── */}
        <section className="order-card order-note">
          <p className="order-note-text">
            <Lightbulb
              size={18}
              color="#facc15"
              fill="#facc15"
              strokeWidth={1.5}
              className="mr-2"
            />
            {isReady
              ? "Your order is ready! Please pay and collect it from the counter."
              : "This page updates automatically. Payment will be collected at the counter."}
          </p>
        </section>

        <button
          className="order-more-btn colorful-home-btn"
          onClick={() => navigate("/")}
        >
          <Home size={20} className="home-colored" />
          Order More
        </button>
      </div>
    </div>
  );
}
