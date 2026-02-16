import { useState } from "react";
import { Flex, Text, Button } from "@radix-ui/themes";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check } from "lucide-react";
import { useCart } from "./CartContext";

type OrderType = "dine-in" | "takeaway" | "delivery" | "online";
type PaymentMethod = "cash" | "upi" | "gpay" | "phonepe" | "paytm" | "card";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  discount: number;
}

export const CheckoutDialog = ({ open, onClose, discount }: CheckoutDialogProps) => {
  const { items, total, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");

  const discountedTotal = Math.max(total - discount, 0);

  const handleCompleteOrder = () => {
    const orderData = {
      items,
      customerName,
      phone,
      orderType,
      paymentMethod,
      notes,
      subtotal: total,
      discount,
      total: discountedTotal,
      timestamp: new Date().toISOString(),
    };

    console.log("ORDER PLACED:", orderData);
    
    // Clear cart and close dialog
    clearCart();
    onClose();
  };

  const orderTypeButtons: { value: OrderType; label: string }[] = [
    { value: "dine-in", label: "Dine In" },
    { value: "takeaway", label: "Takeaway" },
    { value: "delivery", label: "Delivery" },
    { value: "online", label: "Online Order" },
  ];

  const paymentMethodButtons: { value: PaymentMethod; label: string; icon?: string }[] = [
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "upi", label: "UPI", icon: "📱" },
    { value: "phonepe", label: "PhonePe",icon: "📱" },
    { value: "gpay", label: "GPay",icon: "📱" },
    { value: "paytm", label: "Paytm",icon: "📱" },
    { value: "card", label: "Card", icon: "💳" },
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
            padding: 24,
            width: 540,
            maxHeight: "90vh",
            overflowY: "auto",
            zIndex: 1001,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}
        >
          {/* HEADER */}
          <Flex justify="between" align="center" mb="4">
            <Text size="6" weight="bold">
              Complete Order
            </Text>
            <Dialog.Close asChild>
              <Button variant="ghost" style={{ cursor: "pointer" }}>
                <X size={20} />
              </Button>
            </Dialog.Close>
          </Flex>

          {/* ORDER SUMMARY */}
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
              <Text size="2" >
                {items.length} item(s)
              </Text>
              <Text size="2">₹{total}</Text>
            </Flex>

            {discount > 0 && (
              <Flex justify="between" mb="3">
                <Text size="2">
                  Discount
                </Text>
                <Text size="2" color="red">
                  -₹{discount}
                </Text>
              </Flex>
            )}

            <Flex justify="between" mt="3" pt="3" style={{ borderTop: "1px solid var(--gray-a6)" }}>
              <Text size="4" weight="bold">
                Total
              </Text>
              <Text size="5" weight="bold" color="green">
                ₹{discountedTotal}
              </Text>
            </Flex>
          </div>

          {/* CUSTOMER INFO */}
          <Flex gap="3" mb="3">
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
                placeholder="Enter phone"
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

          {/* ORDER TYPE */}
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
                    flex: "1 1 auto",
                    padding: "10px 16px",
                    border: "none",
                    borderRadius: 8,
                    background: orderType === btn.value ? "var(--green-9)" : "var(--gray-a3)",
                    
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </Flex>
          </div>

          {/* PAYMENT METHOD */}
          <div style={{ marginBottom: 20 }}>
            <Text size="2" weight="medium" style={{ marginBottom: 8, display: "block" }}>
              Payment Method
            </Text>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
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
                    
                    fontWeight: 500,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  {btn.icon && <span>{btn.icon}</span>}
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* NOTES */}
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

          {/* FOOTER BUTTONS */}
          <Flex gap="3">
            <Dialog.Close asChild>
              <Button
                variant="outline"
                style={{ flex: 1, height: 44, cursor: "pointer" }}
              >
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