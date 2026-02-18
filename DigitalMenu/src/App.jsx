import PublicMenu from "./pages/PublicMenu";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <PublicMenu />
    </CartProvider>
  );
}
