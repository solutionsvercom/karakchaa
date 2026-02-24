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

  const { orderNumber, items, subtotal, tax, total } = state;

  return (
    <div className="order-page">
      <div className="order-shell">

        {/* ── HEADER ── */}
        <header className="order-header cancelled-header">
          <p className="order-label">Order Number</p>
          <p className="order-code">#{orderNumber}</p>
        </header>

        {/* ── CANCELLATION HERO ── */}
        <section className="order-complete-hero order-cancelled-hero">
          <div className="order-complete-icon-wrap order-cancelled-icon-wrap">
            <XCircle className="order-complete-icon order-cancelled-icon" />
          </div>
          <h2 className="order-complete-title order-cancelled-title">
            Order Cancelled
          </h2>
          <p className="order-complete-subtitle">
            Your order has been cancelled. Please visit the counter for
            assistance.
          </p>
        </section>

        {/* ── ORDER DETAILS ── */}
        <section className="order-card details-card completed-details-card">
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

          <div className="order-total order-total-completed">
            <div className="order-row order-total-row order-total-subrow">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="order-row order-total-row order-total-subrow">
              <span>GST (5%)</span>
              <span>+ ₹{tax}</span>
            </div>
            <div className="order-row order-total-row order-total-main order-total-main-completed">
              <span>Total</span>
              <span className="order-total-main-value order-total-main-value-completed">
                ₹{total}
              </span>
            </div>
          </div>
        </section>

        {/* ── NOTE ── */}
        <section className="order-card order-note cancelled-note">
          <p className="order-note-text">
            <Lightbulb
              size={18}
              color="#facc15"
              fill="#facc15"
              strokeWidth={1.5}
              className="mr-2"
            />
            If you think this was a mistake, please speak to a staff member at
            the counter.
          </p>
        </section>

        <button
          className="order-more-btn order-more-btn-light"
          onClick={() => navigate("/")}
        >
          <Home size={20} className="home-colored-light" />
          Order More
        </button>
      </div>
    </div>
  );
}
