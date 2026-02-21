import { useState } from "react";
import { Flex, Text, Button } from "@radix-ui/themes";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check } from "lucide-react";
import { useDispatch } from "react-redux";

import { useCart } from "./CartContext";
import { AppDispatch } from "../../store/Store";
import { createOrder } from "../../features/OrdersSlice";

type OrderType = "dine-in" | "takeaway" | "delivery" | "online";
type PaymentMethod = "cash" | "upi" | "gpay" | "phonepe" | "paytm" | "card";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  discount: number;
}

export const CheckoutDialog = ({
  open,
  onClose,
  discount,
}: CheckoutDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, total, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");

  const discountedTotal = Math.max(total - discount, 0);

  const handleCompleteOrder = async () => {
    if (!items.length) return;

    try {
      // New flow: every POS checkout becomes an order first.
      await dispatch(
        createOrder({
          items: items.map((item) => ({
            product: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          customerName: customerName || undefined,
          phone: phone || undefined,
          orderType,
          notes: notes || undefined,
        })
      ).unwrap();

      clearCart();
      onClose();
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  const orderTypeButtons: { value: OrderType; label: string }[] = [
    { value: "dine-in", label: "Dine In" },
    { value: "takeaway", label: "Takeaway" },
    { value: "delivery", label: "Delivery" },
    { value: "online", label: "Online Order" },
  ];

  const paymentMethodButtons: { value: PaymentMethod; label: string }[] = [
    { value: "cash", label: "💵 Cash" },
    { value: "upi", label: "📲 UPI" },
    { value: "phonepe", label: "📱 PhonePe" },
    { value: "gpay", label: "🟢 GPay" },
    { value: "paytm", label: "🔵 Paytm" },
    { value: "card", label: "💳 Card" },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          }}
        />
        <Dialog.Content
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "Canvas",
            color: "CanvasText",
            padding: "clamp(16px, 4vw, 24px)",
            width: "min(540px, calc(100vw - 32px))",
            maxHeight: "90dvh",
            overflowY: "auto",
            zIndex: 1001,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            borderRadius: 16,
          }}
        >
          <Flex justify="between" align="center" mb="4">
            <Dialog.Title asChild>
              <Text size="6" weight="bold">
                Complete Order
              </Text>
            </Dialog.Title>
            <Dialog.Description asChild>
              <span style={{ display: "none" }}>
                Review order items, choose order type and payment method, then confirm.
              </span>
            </Dialog.Description>
            <Dialog.Close asChild>
              <Button variant="ghost" style={{ cursor: "pointer" }}>
                <X size={20} />
              </Button>
            </Dialog.Close>
          </Flex>

          <div
            style={{
              background: "var(--gray-a2)",
              padding: 16,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <Text size="3" weight="bold" style={{ marginBottom: 8, display: "block" }}>
              Order Summary
            </Text>

            <Flex justify="between" mb="2">
              <Text size="2">{items.length} item(s)</Text>
              <Text size="2">Rs {total}</Text>
            </Flex>

            {discount > 0 && (
              <Flex justify="between" mb="3">
                <Text size="2">Discount</Text>
                <Text size="2" color="red">
                  -Rs {discount}
                </Text>
              </Flex>
            )}

            <Flex justify="between" mt="3" pt="3" style={{ borderTop: "1px solid var(--gray-a6)" }}>
              <Text size="4" weight="bold">
                Total
              </Text>
              <Text size="5" weight="bold" color="green">
                Rs {discountedTotal}
              </Text>
            </Flex>
          </div>

          <Flex gap="3" mb="3" wrap="wrap">
            <div style={{ flex: 1 }}>
              <Text size="2" weight="medium" style={{ marginBottom: 4, display: "block" }}>
                Customer Name (Optional)
              </Text>
              <input
                type="text"
                placeholder="Enter name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: "100%",
                  height: 36,
                  padding: "0 12px",
                  border: "1px solid var(--gray-a6)",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <Text size="2" weight="medium" style={{ marginBottom: 4, display: "block" }}>
                Phone (Optional)
              </Text>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="Enter 10-digit phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  height: 36,
                  padding: "0 12px",
                  border: "1px solid var(--gray-a6)",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>
          </Flex>

          <div style={{ marginBottom: 20 }}>
            <Text size="2" weight="medium" style={{ marginBottom: 8, display: "block" }}>
              Order Type
            </Text>
            <Flex gap="2" wrap="wrap">
              {orderTypeButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setOrderType(btn.value)}
                  style={{
                    flex: "1 1 calc(50% - 4px)",
                    minWidth: 80,
                    padding: "10px 8px",
                    border: "none",
                    borderRadius: 8,
                    background: orderType === btn.value ? "var(--green-9)" : "var(--gray-a3)",
                    color: orderType === btn.value ? "white" : "inherit",
                    fontWeight: 500,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </Flex>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Text size="2" weight="medium" style={{ marginBottom: 8, display: "block" }}>
              Payment Method
            </Text>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 8,
              }}
            >
              {paymentMethodButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setPaymentMethod(btn.value)}
                  style={{
                    padding: "10px",
                    border: "none",
                    borderRadius: 8,
                    background: paymentMethod === btn.value ? "var(--green-9)" : "var(--gray-a3)",
                    color: paymentMethod === btn.value ? "white" : "inherit",
                    fontWeight: 500,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Text size="2" weight="medium" style={{ marginBottom: 4, display: "block" }}>
              Notes (Optional)
            </Text>
            <textarea
              placeholder="Any special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid var(--gray-a6)",
                borderRadius: 8,
                fontSize: 14,
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <Flex gap="3">
            <Dialog.Close asChild>
              <Button variant="outline" style={{ flex: 1, height: 44, cursor: "pointer" }}>
                Cancel
              </Button>
            </Dialog.Close>

            <Button
              style={{
                flex: 1,
                height: 44,
                background: "var(--green-9)",
                color: "white",
                cursor: "pointer",
              }}
              onClick={handleCompleteOrder}
            >
              <Check size={18} />
              Complete Order
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};