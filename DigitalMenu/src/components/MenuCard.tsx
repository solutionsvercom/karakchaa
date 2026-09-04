import type { MenuItem } from "../types/menu";
import { useCart } from "../context/CartContext";
import { Minus, Plus } from "lucide-react";
import ProductImage from "./ProductImage";
import { hasDisplayableImage } from "../utils/imageUrl";

type Props = {
  item: MenuItem;
};

export default function MenuCard({ item }: Props) {
  const { add, inc, dec, getQty } = useCart();

  const qty = getQty(item.id);
  const disabled = !item.available;
  const hasImage = hasDisplayableImage(item.image);

  return (
    <div className="menuCard">
      <div className="menuCardMedia">
        {hasImage ? (
          <ProductImage
            src={item.image}
            alt={item.name}
            className={`menuCardImg ${disabled ? "menuCardImgDisabled" : ""}`}
          />
        ) : (
          <div className="menuCardImg menuCardImgPlaceholder" aria-hidden />
        )}

        {!item.available && (
          <div className="menuCardUnavailableOverlay">
            <span className="menuCardUnavailableBadge">Not Available</span>
          </div>
        )}

        {item.available && (
          <div className="menuCardQtyOverlay">
            {qty === 0 ? (
              <button
                type="button"
                className="menuCardAddPill"
                onClick={() => add(item)}
                aria-label={`Add ${item.name}`}
              >
                ADD
                <Plus size={14} strokeWidth={3} />
              </button>
            ) : (
              <div className="menuCardStepper">
                <button
                  type="button"
                  className="menuCardStepperBtn"
                  onClick={() => dec(item.id)}
                  aria-label={`Decrease ${item.name}`}
                >
                  <Minus size={16} strokeWidth={3} />
                </button>
                <span className="menuCardStepperQty">{qty}</span>
                <button
                  type="button"
                  className="menuCardStepperBtn menuCardStepperPlus"
                  onClick={() => inc(item.id)}
                  aria-label={`Increase ${item.name}`}
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="menuCardBody">
        <div className="menuCardHeaderRow">
          <div className="menuCardTitle">{item.name}</div>
          <div className="menuCardPrice">₹{item.price}</div>
        </div>
        <div className="menuCardCategory">{item.category}</div>
      </div>
    </div>
  );
}
