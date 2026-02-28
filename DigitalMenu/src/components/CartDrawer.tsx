import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { createDigitalOrder } from "../features/DigitalOrderSlice"; 
import { useCart } from "../context/CartContext";
import {
  X,
  ShoppingBag,
  User,
  Phone,
  Hash,
  UtensilsCrossed,
  Package,
  Trash2,
  Minus,
  Plus,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

type OrderType = "dinein" | "takeaway";

export default function CartDrawer({ open, onClose }: Props) {
  const { items, subtotal, totalQty, inc, dec, remove, clear } = useCart();
  const navigate = useNavigate();
const dispatch = useAppDispatch();
  const list = Object.values(items);

  const [orderType, setOrderType] = useState<OrderType>("dinein");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [table, setTable] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      document.body.classList.add("cart-open");
    } else {
      document.body.classList.remove("cart-open");
    }

    return () => document.body.classList.remove("cart-open");
  }, [open]);

  const taxRate = 0.05;

  const tax = useMemo(() => Math.round(subtotal * taxRate), [subtotal]);
  const total = useMemo(() => Math.round(subtotal + tax), [subtotal, tax]);

  const currencySubtotal = useMemo(() => `₹${subtotal}`, [subtotal]);

  const handlePlaceOrder = async () => {
  if (!list.length) return;

  try {
    console.log("🔵 Starting order creation...");

    const orderPayload = {
      items: list.map(({ item, qty }: any) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: qty,
      })),
      customerName: name || "Guest",
      phone: phone || "",
      tableNumber: table || "",
      orderType: "online", // ← Always 'online' for digital menu
      notes: notes || "", // ← Include notes
    };

    console.log("📤 Sending payload:", orderPayload);

    const result = await dispatch(createDigitalOrder(orderPayload)).unwrap();
    
    console.log("✅ Order created:", result);

    const orderItems = list.map(({ item, qty }: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty,
    }));

    clear();
    onClose();

    navigate("/order-status", {
      state: {
        orderNumber: result.orderNumber || result._id,
        items: orderItems,
        subtotal,
        tax,
        total,
        orderType: "online",
        name,
        phone,
        table,
        notes,
        // Prefer orderNumber for customer tracking UI, keep _id fallback compatibility.
        backendOrderId: result.orderNumber || result._id,
      },
    });
    
  } catch (error: any) {
    console.error("❌ Full error:", error);
    const errorMessage = error.message || "Failed to place order. Please try again.";
    alert(`Order failed: ${errorMessage}\n\nCheck console for details.`);
  }
};

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`cartBackdrop ${open ? "cartBackdropOpen" : ""}`}
        onClick={onClose}
      />

      {/* DRAWER */}
      <aside
        className={`cartDrawer ${open ? "cartDrawerOpen" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="cartHeader">
          <div>
            <div className="cartTitle">Your Order</div>
            <div className="cartSub">{totalQty} item(s)</div>
          </div>

          <button className="iconBtn" onClick={onClose} title="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="cartBodyPro">
          {/* ITEMS */}
          <div className="cartSection">
            {list.length === 0 ? (
              <div className="emptyCartPro">
                <ShoppingBag size={40} />
                <div>Your cart is empty</div>
              </div>
            ) : (
              <div className="orderList">
                {list.map(({ item, qty }: any) => (
                  <div className="orderRow" key={item.id}>
                    {/* IMAGE */}
                    <div className="orderThumb">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <ShoppingBag size={18} />
                      )}
                    </div>

                    {/* INFO */}
                    <div className="orderInfo">
                      <div className="orderName">{item.name}</div>
                      <div className="orderPrice">₹{item.price}</div>
                    </div>

                    {/* QTY */}
                    <div className="orderRight">
                      <div className="qtyPillCart">
                        <button
                          className="qtyPillBtn"
                          onClick={() => dec(item.id)}
                          title="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>

                        <div className="qtyPillValue">{qty}</div>

                        <button
                          className="qtyPillBtn qtyPillBtnPrimary"
                          onClick={() => inc(item.id)}
                          title="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* TRASH BUTTON */}
                      <button
                        className="trashBtn"
                        onClick={() => remove(item.id)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ORDER TYPE */}
          <div className="cartSection">
            <div className="cartSectionTitle">Order Type</div>

            <div className="orderTypeGrid">
              <button
                className={`orderTypeCard ${
                  orderType === "dinein" ? "orderTypeCardActive" : ""
                }`}
                onClick={() => setOrderType("dinein")}
              >
                <UtensilsCrossed size={22} />
                <div>Dine In</div>
              </button>

              <button
                className={`orderTypeCard ${
                  orderType === "takeaway" ? "orderTypeCardActive" : ""
                }`}
                onClick={() => setOrderType("takeaway")}
              >
                <Package size={22} />
                <div>Takeaway</div>
              </button>
            </div>
          </div>

          {/* DETAILS */}
          <div className="cartSection">
            <div className="cartSectionTitle">Your Details</div>

            <div className="formStack">
              <div className="inputWrap">
                <User className="inputIcon" size={18} />
                <input
                  className="textInput"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="inputWrap">
                <Phone className="inputIcon" size={18} />
                <input
                  className="textInput"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="inputWrap">
                <Hash className="inputIcon" size={18} />
                <input
                  className="textInput"
                  placeholder="Table Number"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* NOTES */}
          <div className="cartSection">
            <div className="cartSectionTitle">Special Instructions</div>

            <textarea
              className="textArea"
              placeholder="Any special requests..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* CLEAR */}
          {list.length > 0 && (
            <div className="cartSection clearCartWrap">
              <button className="secondaryBtnPro clearCartBtn" onClick={clear}>
                <Trash2 size={16} />
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="cartFooterPro">
          {/* Order Summary Card */}
          <div className="orderSummaryCard">
            <div className="summaryTitle">Order Summary</div>

            <div className="summaryRow">
              <span>Subtotal</span>
              <span>{currencySubtotal}</span>
            </div>

            <div className="summaryRow">
              <span>GST (5%)</span>
              <span>+ ₹{tax}</span>
            </div>

            <div className="summaryDivider"></div>

            <div className="summaryRow totalRow">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            className="checkoutBtnPro"
            disabled={list.length === 0}
            onClick={handlePlaceOrder}
          >
            Place Order — ₹{total}
          </button>
        </div>
      </aside>
    </>
  );
}
