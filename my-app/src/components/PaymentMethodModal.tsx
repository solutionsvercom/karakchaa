import React, { useState } from "react";
import { Flex, Text, Button, Dialog, Grid, Box } from "@radix-ui/themes";
import { 
  X, 
  Check, 
  Banknote, 
  QrCode, 
  Smartphone, 
  CreditCard, 
  Wallet 
} from "lucide-react";

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

  const paymentOptions: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: "Cash", label: "Cash", icon: <Banknote size={20} strokeWidth={1.5} /> },
    { value: "UPI", label: "UPI", icon: <QrCode size={20} strokeWidth={1.5} /> },
    { value: "PhonePe", label: "PhonePe", icon: <Smartphone size={20} strokeWidth={1.5} /> },
    { value: "GPay", label: "GPay", icon: <Smartphone size={20} strokeWidth={1.5} /> },
    { value: "Paytm", label: "Paytm", icon: <Smartphone size={20} strokeWidth={1.5} /> },
    { value: "Card", label: "Card", icon: <CreditCard size={20} strokeWidth={1.5} /> },
    { value: "Other", label: "Other", icon: <Wallet size={20} strokeWidth={1.5} /> },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen && !loading) onClose(); }}>
      <Dialog.Content 
        maxWidth="480px" 
        style={{ 
          borderRadius: "24px", 
          padding: "32px",
          boxShadow: "0 24px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* ===== HEADER ===== */}
        <Flex justify="between" align="center" mb="6">
          <Box>
            <Dialog.Title style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "var(--gray-12)", letterSpacing: "-0.01em" }}>
              Payment Method
            </Dialog.Title>
            <Text size="2" style={{ color: "var(--gray-10)", marginTop: "4px", display: "block" }}>
              Select how the customer would like to pay
            </Text>
          </Box>
          <Dialog.Close>
            <Button 
              variant="ghost" 
              color="gray" 
              disabled={loading} 
              style={{ margin: 0, padding: "8px", height: "auto", cursor: "pointer", borderRadius: "50%" }}
            >
              <X size={20} />
            </Button>
          </Dialog.Close>
        </Flex>

        {/* ===== PAYMENT STRIP ===== */}
        <Box mb="6">
          <Grid columns="3" gap="3">
            {paymentOptions.map((btn) => {
              const isSelected = paymentMethod === btn.value;
              return (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => setPaymentMethod(btn.value)}
                  disabled={loading}
                  style={{
                    height: 80,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    borderRadius: "16px",
                    border: isSelected 
                      ? "1.5px solid var(--accent-9)" 
                      : "1px solid var(--gray-5)",
                    background: isSelected ? "var(--accent-2)" : "var(--gray-1)",
                    color: isSelected ? "var(--accent-11)" : "var(--gray-11)",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: isSelected 
                      ? "0 4px 12px rgba(var(--accent-a-rgb), 0.1)" 
                      : "0 1px 2px rgba(0,0,0,0.02)",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !loading) {
                      e.currentTarget.style.borderColor = "var(--gray-7)";
                      e.currentTarget.style.background = "var(--gray-2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !loading) {
                      e.currentTarget.style.borderColor = "var(--gray-5)";
                      e.currentTarget.style.background = "var(--gray-1)";
                    }
                  }}
                >
                  {btn.icon}
                  <Text size="2" weight={isSelected ? "bold" : "medium"} style={{ letterSpacing: "0.01em" }}>
                    {btn.label}
                  </Text>
                </button>
              );
            })}
          </Grid>
        </Box>

        {/* ACTIONS  */}
        <Flex gap="3" mt="6" pt="4" style={{ borderTop: "1px solid var(--gray-4)" }}>
          <Dialog.Close>
            <Button
              variant="soft" 
              color="gray"
              style={{ 
                flex: "0 0 auto",
                padding: "0 24px",
                height: 48, 
                borderRadius: 14, 
                fontSize: 15, 
                cursor: loading ? "not-allowed" : "pointer", 
                fontWeight: 600,
                color: "var(--gray-11)"
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </Dialog.Close>

          <Button
            style={{
              flex: 1,
              height: 48,
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              background: loading ? "var(--gray-8)" : "var(--accent-9)",
              color: loading ? "var(--gray-1)" : "white",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(var(--accent-9-rgb), 0.2)",
              transition: "transform 0.1s ease",
            }}
            onClick={handleConfirm}
            disabled={loading}
            onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = "scale(0.98)" }}
            onMouseUp={(e) => { if (!loading) e.currentTarget.style.transform = "scale(1)" }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.transform = "scale(1)" }}
          >
            <Check size={18} strokeWidth={2.5} />
            {loading ? "Processing..." : "Confirm & Complete"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
