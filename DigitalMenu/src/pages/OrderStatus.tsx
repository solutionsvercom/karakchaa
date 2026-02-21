import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock3, CheckCircle2, Loader2, Home, Lightbulb } from "lucide-react";
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

export default function OrderStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderState | null;

  const [stepIndex, setStepIndex] = useState(0); 

  // handle missing state + auto-progress + go to completed page
  useEffect(() => {
    if (!state) {
      navigate("/");
      return;
    }

    const totalSteps = 4;      
    const perStepMs = 2000;    

    let current = 0;

    const timer = setInterval(() => {
      current += 1;

      if (current < totalSteps) {
        setStepIndex(current);
      } else {
        clearInterval(timer);
        navigate("/order-completed", { state });
      }
    }, perStepMs);

    return () => clearInterval(timer);
  }, [state, navigate]);

  if (!state) return null;

  const { orderNumber, items, subtotal, tax, total } = state;

  return (
    <div className="order-page">
      <div className="order-shell">
        <header className="order-header">
          <p className="order-label">Order Number</p>
          <p className="order-code">#{orderNumber}</p>
        </header>

        <section className="order-card status-card">
          <h2 className="card-title">Order Status</h2>

          <div className="status-timeline">
            <div className={`status-step ${stepIndex === 0 ? "active" : ""}`}>
              <div
                className={`status-icon-wrapper ${
                  stepIndex === 0 ? "active" : ""
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

            <div className={`status-step ${stepIndex === 1 ? "active" : ""}`}>
              <div
                className={`status-icon-wrapper ${
                  stepIndex === 1 ? "active" : ""
                }`}
              >
                <CheckCircle2 className="status-icon" />
              </div>
              <div className="status-text">
                <p
                  className={`status-title ${
                    stepIndex >= 1 ? "" : "muted"
                  }`}
                >
                  Confirmed
                </p>
              </div>
            </div>

            <div className="status-connector" />

            <div className={`status-step ${stepIndex === 2 ? "active" : ""}`}>
              <div
                className={`status-icon-wrapper ${
                  stepIndex === 2 ? "active" : ""
                }`}
              >
                <Loader2 className="status-icon" />
              </div>
              <div className="status-text">
                <p
                  className={`status-title ${
                    stepIndex >= 2 ? "" : "muted"
                  }`}
                >
                  Preparing
                </p>
              </div>
            </div>

            <div className="status-connector" />

            <div className={`status-step ${stepIndex === 3 ? "active" : ""}`}>
              <div
                className={`status-icon-wrapper ${
                  stepIndex === 3 ? "active" : ""
                }`}
              >
                <CheckCircle2 className="status-icon" />
              </div>
              <div className="status-text">
                <p
                  className={`status-title ${
                    stepIndex >= 3 ? "" : "muted"
                  }`}
                >
                  Ready
                </p>
              </div>
            </div>
          </div>
        </section>

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

        <section className="order-card order-note">
          <p className="order-note-text">
            <Lightbulb
              size={18}
              color="#facc15"
              fill="#facc15"
              strokeWidth={1.5}
              className="mr-2"
            />
            This page updates automatically. Payment will be collected at the
            counter.
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