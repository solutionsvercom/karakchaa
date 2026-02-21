import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Home, Lightbulb } from "lucide-react";
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

export default function OrderCompletedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderState | null;

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
      
        <header className="order-header completed-header">
          <p className="order-label">Order Number</p>
          <p className="order-code">#{orderNumber}</p>
        </header>

       
        <section className="order-complete-hero">
          <div className="order-complete-icon-wrap">
            <CheckCircle2 className="order-complete-icon" />
          </div>
          <h2 className="order-complete-title">Order Completed!</h2>
          <p className="order-complete-subtitle">
            Thank you for your order
          </p>
        </section>

       
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

        
        <section className="order-card order-note completed-note">
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