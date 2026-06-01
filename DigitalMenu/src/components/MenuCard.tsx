import type { MenuItem } from "../types/menu";
import { useCart } from "../context/CartContext";
import { Minus, Plus } from "lucide-react";
import ProductImage from "./ProductImage";

type Props = {
  item: MenuItem;
};

export default function MenuCard({ item }: Props) {
  const { add, inc, dec, getQty } = useCart();

  const qty = getQty(item.id);
  const disabled = !item.available;
  const hasImage = Boolean(item.image && String(item.image).trim());

  return (
    <div className="menuCard">

      <div className="menuCardMedia">

  {hasImage ? (
    <ProductImage
      src={item.image}
      alt={item.name}
      className={`menuCardImg ${!item.available ? "menuCardImgDisabled" : ""}`}
    />
  ) : (
    <div className="menuCardImg menuCardImgPlaceholder" aria-hidden />
  )}

  {!item.available && (
    <div className="menuCardUnavailableOverlay">
      <span className="menuCardUnavailableBadge">
        Not Available
      </span>
    </div>
  )}

</div>


      <div className="menuCardBody">

        <div className="menuCardHeaderRow">

          <div className="menuCardTitle">
            {item.name}
          </div>

          <div className="menuCardPrice">
            ₹{item.price}
          </div>

        </div>

        <div className="menuCardCategory">
          {item.category}
        </div>


        {qty === 0 ? (

         <button
  className={`addCartBtn ${!item.available ? "addCartBtnDisabled" : ""}`}
  onClick={() => add(item)}
  disabled={!item.available}
>
  {item.available ? "+ Add to Cart" : "Unavailable"}
</button>


        ) : (

          <div className="qtyControl">

            <button
              className="qtyBtn qtyMinus"
              onClick={() => dec(item.id)}
              title="Decrease quantity"
            >
              <Minus size={14} />
            </button>

            <div className="qtyNumber">
              {qty}
            </div>

            <button
              className="qtyBtn qtyPlus"
              onClick={() => inc(item.id)}
              title="Increase quantity"
            >
              <Plus size={14} />
            </button>

          </div>

        )}

      </div>
    </div>
  );
}
