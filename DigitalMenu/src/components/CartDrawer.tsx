import { useMemo, useState } from "react";
import { useCart } from "../context/CartContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

type OrderType = "dinein" | "takeaway";

export default function CartDrawer({ open, onClose }: Props) {
  const { items, subtotal, totalQty, inc, dec, remove, clear } = useCart();
  const list = Object.values(items);

  const [orderType, setOrderType] = useState<OrderType>("dinein");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [table, setTable] = useState("");
  const [notes, setNotes] = useState("");

  const currencySubtotal = useMemo(() => `₹${subtotal}`, [subtotal]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cartBackdrop ${open ? "cartBackdropOpen" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={`cartDrawer ${open ? "cartDrawerOpen" : ""}`}>
        {/* Header */}
        <div className="cartHeader">
          <div>
            <div className="cartTitle">Your Order</div>
            <div className="cartSub">{totalQty} item(s)</div>
          </div>

          <button className="iconBtn" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="cartBodyPro">
          {/* Items */}
          <div className="cartSection">
            {list.length === 0 ? (
              <div className="emptyCartPro">
                <div className="emptyTitle">Your cart is empty</div>
                <div className="emptySub">Add items from the menu.</div>
              </div>
            ) : (
              <div className="orderList">
                {list.map(({ item, qty }) => (
                  <div className="orderRow" key={item.id}>
                    <div className="orderThumb">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : null}
                      <div className="orderThumbFallback" aria-hidden>
                        👜
                      </div>
                    </div>

                    <div className="orderInfo">
                      <div className="orderName">{item.name}</div>
                      <div className="orderPrice">₹{item.price}</div>
                    </div>

                    <div className="orderRight">
                      <div className="qtyPill qtyPillCart">
                        <button
                          className="qtyPillBtn"
                          onClick={() => dec(item.id)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <div className="qtyPillValue" aria-label={`Qty ${qty}`}>
                          {qty}
                        </div>

                        <button
                          className="qtyPillBtn qtyPillBtnPrimary"
                          onClick={() => inc(item.id)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="trashBtn"
                        onClick={() => remove(item.id)}
                        aria-label="Remove item"
                        title="Remove"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Type */}
          <div className="cartSection">
            <div className="cartSectionTitle">Order Type</div>
            <div className="orderTypeGrid">
              <button
                type="button"
                className={`orderTypeCard ${
                  orderType === "dinein" ? "orderTypeCardActive" : ""
                }`}
                onClick={() => setOrderType("dinein")}
              >
                <div className="orderTypeIcon" aria-hidden>
                  🍽️
                </div>
                <div className="orderTypeText">Dine-in</div>
              </button>

              <button
                type="button"
                className={`orderTypeCard ${
                  orderType === "takeaway" ? "orderTypeCardActive" : ""
                }`}
                onClick={() => setOrderType("takeaway")}
              >
                <div className="orderTypeIcon" aria-hidden>
                  📦
                </div>
                <div className="orderTypeText">Takeaway</div>
              </button>
            </div>
          </div>

          {/* Your Details */}
          <div className="cartSection">
            <div className="cartSectionTitle">Your Details</div>

            <div className="formStack">
              <div className="inputWrap">
                <span className="inputIcon" aria-hidden>
                  👤
                </span>
                <input
                  className="textInput"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="inputWrap">
                <span className="inputIcon" aria-hidden>
                  📞
                </span>
                <input
                  className="textInput"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="inputWrap">
                <span className="inputIcon" aria-hidden>
                  #
                </span>
                <input
                  className="textInput"
                  placeholder="Table Number"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="cartSection">
            <div className="cartSectionTitle">Special Instructions</div>
            <textarea
              className="textArea"
              placeholder="Any notes for the kitchen? (e.g., less spicy, no onion)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Clear */}
          {list.length > 0 ? (
            <div className="cartSection">
              <button className="secondaryBtnPro" onClick={clear}>
                Clear cart
              </button>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="cartFooterPro">
          <div className="totalRowPro">
            <div className="totalLabelPro">Subtotal</div>
            <div className="totalValuePro">{currencySubtotal}</div>
          </div>

          <button
            className="checkoutBtnPro"
            disabled={list.length === 0}
            onClick={() => alert("Checkout flow next ✅")}
          >
            Checkout
          </button>
        </div>
      </aside>
    </>
  );
}
