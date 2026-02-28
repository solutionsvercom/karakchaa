import { useState } from "react";
import { Flex, Text, Button } from "@radix-ui/themes";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check } from "lucide-react";

type PaymentMethod = "Cash" | "UPI" | "PhonePe" | "GPay" | "Paytm" | "Card" | "Other";

interface PaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  loading?: boolean;
}

export const PaymentMethodModal = ({
  open,
  onClose,
  onConfirm,
  loading = false,
}: PaymentMethodModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");

  const handleConfirm = () => {
    onConfirm(paymentMethod);
  };

  const paymentMethodButtons: { value: PaymentMethod; label: string }[] = [
    { value: "Cash", label: "Cash" },
    { value: "UPI", label: "UPI" },
    { value: "PhonePe", label: "PhonePe" },
    { value: "GPay", label: "GPay" },
    { value: "Paytm", label: "Paytm" },
    { value: "Card", label: "Card" },
    { value: "Other", label: "Other" },
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
            width: "min(420px, calc(100vw - 32px))",
            maxHeight: "90dvh",
            overflowY: "auto",
            zIndex: 1001,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            borderRadius: 16,
          }}
        >
          {/* ===== HEADER ===== */}
          <Flex justify="between" align="center" mb="4">
            <Dialog.Title asChild>
              <Text size="6" weight="bold">
                Select Payment Method
              </Text>
            </Dialog.Title>
            <Dialog.Description asChild>
              <span style={{ display: "none" }}>
                Choose the payment method for this order
              </span>
            </Dialog.Description>
            <Dialog.Close asChild>
              <Button variant="ghost" style={{ cursor: "pointer" }}>
                <X size={20} />
              </Button>
            </Dialog.Close>
          </Flex>

          {/* ===== PAYMENT METHOD SELECTION ===== */}
          <div style={{ marginBottom: 20 }}>
            <Text
              size="2"
              weight="medium"
              style={{ marginBottom: 8, display: "block" }}
            >
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
                  disabled={loading}
                  style={{
                    padding: "10px",
                    border: "none",
                    borderRadius: 8,
                    background:
                      paymentMethod === btn.value
                        ? "var(--green-9)"
                        : "var(--gray-a3)",
                    color: paymentMethod === btn.value ? "white" : "inherit",
                    fontWeight: 500,
                    fontSize: 13,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* ===== ACTIONS ===== */}
          <Flex gap="3">
            <Dialog.Close asChild>
              <Button
                variant="outline"
                style={{ flex: 1, height: 44, cursor: "pointer" }}
                disabled={loading}
              >
                Cancel
              </Button>
            </Dialog.Close>

            <Button
              style={{
                flex: 1,
                height: 44,
                background: loading ? "var(--gray-8)" : "var(--green-9)",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={handleConfirm}
              disabled={loading}
            >
              <Check size={18} />
              {loading ? "Processing..." : "Confirm & Complete"}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
