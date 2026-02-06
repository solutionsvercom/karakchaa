import React from "react";
import Pos from "../../modules/Pos/Pos";
import  {CartProvider}  from "../../modules/Pos/CartContext";

export default function PosPage() {
  // return <Pos />;
    return (
    <CartProvider>
      <Pos />
    </CartProvider>
  );
}
