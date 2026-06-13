import React, { useEffect, useMemo, useState } from "react";
import { Flex, Text, Button, Dialog, Grid, Box, TextField } from "@radix-ui/themes";
import {
  X,
  Check,
  Banknote,
  QrCode,
  Smartphone,
  CreditCard,
  Wallet,
} from "lucide-react";

export type PaymentMethod = "Cash" | "UPI" | "PhonePe" | "GPay" | "Paytm" | "Card" | "Other";

export type CashPaymentDetails = {
  amountReceived: number;
  change: number;
};

interface PaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod, cashDetails?: CashPaymentDetails) => void;
  loading?: boolean;
  totalDue?: number;
}

const QUICK_TENDER_AMOUNTS = [100, 200, 500, 1000] as const;

export const PaymentMethodModal = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  totalDue = 0,
}: PaymentMethodModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [amountReceivedInput, setAmountReceivedInput] = useState("");

  const normalizedTotalDue = Math.max(0, Math.round(Number(totalDue) || 0));

  const amountReceived = useMemo(() => {
    const parsed = Math.round(Number(amountReceivedInput) || 0);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }, [amountReceivedInput]);

  const change = useMemo(
    () => Math.max(0, amountReceived - normalizedTotalDue),
    [amountReceived, normalizedTotalDue]
  );

  const isCash = paymentMethod === "Cash";
  const cashInsufficient = isCash && amountReceivedInput !== "" && amountReceived < normalizedTotalDue;
  const cashConfirmBlocked =
    isCash && (amountReceivedInput === "" || amountReceived < normalizedTotalDue);

  const resetCashFields = () => {
    setAmountReceivedInput("");
  };

  useEffect(() => {
    if (!open) {
      resetCashFields();
      setPaymentMethod("Cash");
    }
  }, [open]);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method !== "Cash") {
      resetCashFields();
    }
  };

  const handleConfirm = () => {
    if (cashConfirmBlocked) return;

    if (isCash) {
      onConfirm(paymentMethod, { amountReceived, change });
      return;
    }

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
        <Flex justify="between" align="center" mb="5">
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

        <Box
          mb="5"
          style={{
            background: "linear-gradient(145deg, var(--gray-1) 0%, var(--gray-2) 100%)",
            border: "1px solid var(--gray-5)",
            borderRadius: "16px",
            padding: "16px 18px",
          }}
        >
          <Flex justify="between" align="center">
            <Text size="2" weight="medium" style={{ color: "var(--gray-11)" }}>
              Total Due
            </Text>
            <Text size="6" weight="bold" style={{ color: "var(--green-10)", letterSpacing: "-0.02em", lineHeight: 1 }}>
              ₹{normalizedTotalDue}
            </Text>
          </Flex>
        </Box>

        <Box mb={isCash ? "4" : "6"}>
          <Grid columns="3" gap="3">
            {paymentOptions.map((btn) => {
              const isSelected = paymentMethod === btn.value;
              return (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => handlePaymentMethodChange(btn.value)}
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

        {isCash && (
          <Box mb="6">
            <Text as="label" size="2" weight="medium" style={{ marginBottom: "8px", display: "block", color: "var(--gray-12)" }}>
              Amount Received
            </Text>
            <TextField.Root
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter cash received"
              value={amountReceivedInput}
              onChange={(e) => setAmountReceivedInput(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              size="3"
              radius="medium"
              variant="surface"
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: "12px",
                boxShadow: "none",
                borderColor: cashInsufficient ? "var(--red-7)" : "var(--gray-5)",
                backgroundColor: "var(--gray-1)",
              }}
            />

            <Flex gap="2" wrap="wrap" mb="4">
              <button
                type="button"
                disabled={loading}
                onClick={() => setAmountReceivedInput(String(normalizedTotalDue))}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid var(--accent-7)",
                  background: "var(--accent-2)",
                  color: "var(--accent-11)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Exact
              </button>
              {QUICK_TENDER_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  disabled={loading}
                  onClick={() => setAmountReceivedInput(String(amount))}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid var(--gray-5)",
                    background: "var(--gray-1)",
                    color: "var(--gray-11)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  ₹{amount}
                </button>
              ))}
            </Flex>

            {cashInsufficient && (
              <Text size="2" style={{ color: "var(--red-11)", marginBottom: "10px", display: "block" }}>
                Amount received must be at least ₹{normalizedTotalDue}
              </Text>
            )}

            <Box
              style={{
                background: "var(--green-2)",
                border: "1px solid var(--green-6)",
                borderRadius: "14px",
                padding: "16px 18px",
              }}
            >
              <Flex justify="between" align="center">
                <Text size="2" weight="medium" style={{ color: "var(--green-11)" }}>
                  Change to return
                </Text>
                <Text size="7" weight="bold" style={{ color: "var(--green-11)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  ₹{change}
                </Text>
              </Flex>
            </Box>
          </Box>
        )}

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
                color: "var(--gray-11)",
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
              background: loading || cashConfirmBlocked ? "var(--gray-8)" : "var(--accent-9)",
              color: loading || cashConfirmBlocked ? "var(--gray-1)" : "white",
              cursor: loading || cashConfirmBlocked ? "not-allowed" : "pointer",
              boxShadow: loading || cashConfirmBlocked ? "none" : "0 4px 12px rgba(var(--accent-9-rgb), 0.2)",
              transition: "transform 0.1s ease",
            }}
            onClick={handleConfirm}
            disabled={loading || cashConfirmBlocked}
            onMouseDown={(e) => { if (!loading && !cashConfirmBlocked) e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { if (!loading && !cashConfirmBlocked) e.currentTarget.style.transform = "scale(1)"; }}
            onMouseLeave={(e) => { if (!loading && !cashConfirmBlocked) e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Check size={18} strokeWidth={2.5} />
            {loading ? "Processing..." : "Confirm & Complete"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
