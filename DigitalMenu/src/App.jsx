import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicMenu from "./pages/PublicMenu";
import OrderStatusPage from "./pages/OrderStatus";
import OrderCompletedPage from "./pages/OrderCompleted"; 
import OrderCancelledPage from "./pages/OrderCancelled";


import { CartProvider } from "./context/CartContext";
import "./App.css";
import './PublicMenu.enhance.css';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="appViewport">
          <Routes>
            <Route path="/" element={<PublicMenu />} />
            <Route path="/order-status" element={<OrderStatusPage />} />
            <Route path="/order-completed" element={<OrderCompletedPage />} />
            <Route path="/order-cancelled" element={<OrderCancelledPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}