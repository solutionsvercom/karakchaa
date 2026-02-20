import PublicMenu from "./pages/PublicMenu";
import { CartProvider } from "./context/CartContext";
import "./App.css";

export default function App() {
  return (
    <CartProvider>
  <div className="appViewport">
    <PublicMenu />
  </div>
</CartProvider>

  );
}
