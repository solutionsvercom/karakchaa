import type { MenuItem } from "../types/menu";
import { useCart } from "../context/CartContext";

type Props = {
  item: MenuItem;
};

export default function MenuCard({ item }: Props) {
  const { add, inc, dec, getQty } = useCart();
  const qty = getQty(item.id);
  const disabled = !item.available;

  return (
    <div className={`menuCard ${disabled ? "menuCardDisabled" : ""}`}>
      <div className="menuCardMedia" aria-hidden>
        {item.image ? (
          <img
            className="menuCardImg"
            src={item.image}
            alt={item.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <div className="menuCardPlaceholder">👜</div>
      </div>

      <div className="menuCardBody">
        <div className="menuCardTopRow">
          <div className="menuCardTitle">{item.name}</div>
          <div className="menuCardPrice">₹{item.price}</div>
        </div>

        <div className="menuCardSubRow">{item.category}</div>

        <div className="menuCardBottomRow">
          <div className="qtyPill">
            <button
              className="qtyPillBtn"
              onClick={() => dec(item.id)}
              disabled={qty === 0}
              aria-label="Decrease quantity"
            >
              −
            </button>

            <div className="qtyPillValue" aria-label={`Quantity ${qty}`}>
              {qty}
            </div>

            <button
              className="qtyPillBtn qtyPillBtnPrimary"
              onClick={() => (qty === 0 ? add(item) : inc(item.id))}
              disabled={disabled}
              aria-label="Increase quantity"
              title={disabled ? "Item not available" : "Add"}
            >
              +
            </button>
          </div>

          {!item.available ? <div className="outBadge">Out</div> : null}
        </div>
      </div>
    </div>
  );
}
