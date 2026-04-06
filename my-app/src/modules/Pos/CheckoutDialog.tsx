import React, { useState } from "react";
import { Flex, Text, Button, Dialog, TextField, TextArea, Box, Grid } from "@radix-ui/themes";
import { 
  X, 
  Check, 
  Banknote, 
  QrCode, 
  Smartphone, 
  CreditCard, 
  Wallet,
  Utensils,
  ShoppingBag,
  Truck,
  Globe
} from "lucide-react";
import { useDispatch } from "react-redux";
import { Toast, ToastProvider, ToastViewport } from "../../components/Toast";

import { useCart } from "./CartContext";
import { AppDispatch } from "../../store/Store";
import { createOrder } from "../../features/OrdersSlice";
import { fetchSales } from "../../features/SalesSlice";
import { fetchCustomers } from "../../features/CustomersSlice";
import { fetchStockItems } from "../../features/StockmanagementSlice";
import { fetchProducts } from "../../features/ProductsSlice";

type OrderType = "dine-in" | "takeaway" | "delivery" | "online";
type PaymentMethod = "Cash" | "UPI" | "PhonePe" | "GPay" | "Paytm" | "Card" | "Other";

// discount and gstRate arguments are now optional and mainly satisfied by `useCart().pricing` under the hood
interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  discount?: number;
  gstRate?: number;
}

export const CheckoutDialog = ({
  open,
  onClose,
}: CheckoutDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, pricing, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", description: "" });
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "info">("success");

  // Fallback to defaults in case pricing is not yet calculated or items logic is missing 
  const safePricing = pricing || { subtotal: 0, discount: 0, gstAmount: 0, total: 0 };

  const handleCompleteOrder = async () => {
    if (!items.length) return;

    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newOrder = await dispatch(
        createOrder({
          items: items.map((item) => ({
            product: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          customerName: customerName.trim(),
          phone: phone.trim(),
          orderType,
          paymentMethod,
          notes: notes || undefined,
        })
      ).unwrap();

      clearCart();
      dispatch(fetchSales());
      dispatch(fetchCustomers({ page: 1, limit: 100000 }));
      dispatch(fetchStockItems());
      dispatch(fetchProducts());

      setToastMessage({
        title: "Order Completed!",
        description: `Invoice generated successfully`,
      });
      setToastVariant("success");
      setToastOpen(true);

      setCustomerName("");
      setPhone("");
      setNotes("");
      setOrderType("dine-in");
      setPaymentMethod("Cash");
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const orderTypeOptions: { value: OrderType; label: string; icon: React.ReactNode }[] = [
    { value: "dine-in", label: "Dine In", icon: <Utensils size={20} strokeWidth={1.5} /> },
    { value: "takeaway", label: "Takeaway", icon: <ShoppingBag size={20} strokeWidth={1.5} /> },
    { value: "delivery", label: "Delivery", icon: <Truck size={20} strokeWidth={1.5} /> },
    { value: "online", label: "Online", icon: <Globe size={20} strokeWidth={1.5} /> },
  ];

  const paymentOptions: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: "Cash", label: "Cash", icon: <Banknote size={18} strokeWidth={1.5} /> },
    { value: "UPI", label: "UPI", icon: <QrCode size={18} strokeWidth={1.5} /> },
    { value: "PhonePe", label: "PhonePe", icon: <Smartphone size={18} strokeWidth={1.5} /> },
    { value: "GPay", label: "GPay", icon: <Smartphone size={18} strokeWidth={1.5} /> },
    { value: "Paytm", label: "Paytm", icon: <Smartphone size={18} strokeWidth={1.5} /> },
    { value: "Card", label: "Card", icon: <CreditCard size={18} strokeWidth={1.5} /> },
    { value: "Other", label: "Other", icon: <Wallet size={18} strokeWidth={1.5} /> },
  ];

  return (
    <ToastProvider>
      <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
        <Dialog.Content 
          maxWidth="640px" 
          style={{ 
            borderRadius: "24px", 
            padding: "36px",
            boxShadow: "0 24px 60px -16px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* HEADER */}
          <Flex justify="between" align="center" mb="5">
            <Box>
              <Dialog.Title style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "var(--gray-12)", letterSpacing: "-0.01em" }}>
                Complete Order
              </Dialog.Title>
              <Text size="2" style={{ color: "var(--gray-10)", marginTop: "4px", display: "block" }}>
                Review details and finalize the transaction
              </Text>
            </Box>
            <Dialog.Close>
              <Button 
                variant="ghost" 
                color="gray" 
                style={{ margin: 0, padding: "8px", height: "auto", cursor: "pointer", borderRadius: "50%" }}
              >
                <X size={20} />
              </Button>
            </Dialog.Close>
          </Flex>

          {/* ERROR BANNER */}
          {error && (
            <Box
              style={{
                background: "var(--red-3)",
                color: "var(--red-11)",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "24px",
                fontSize: "14px",
                border: "1px solid var(--red-6)",
                fontWeight: 500
              }}
            >
              {error}
            </Box>
          )}

          {/* ORDER SUMMARY */}
          <Box
            style={{
              background: "linear-gradient(145deg, var(--gray-1) 0%, var(--gray-2) 100%)",
              padding: "20px 24px",
              borderRadius: "16px",
              marginBottom: "28px",
              border: "1px solid var(--gray-5)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
            }}
          >
            <Flex justify="between" align="center" mb="4">
              <Text size="3" weight="bold" style={{ color: "var(--gray-11)" }}>
                Order Summary
              </Text>
              <Text size="2" weight="medium" style={{ color: "var(--gray-10)", background: "var(--gray-3)", padding: "4px 10px", borderRadius: "20px" }}>
                {items.length} item(s)
              </Text>
            </Flex>

            {/* Item list */}
            <Flex direction="column" gap="3">
              {items.map((item) => (
                <Flex key={item.id} justify="between" align="center">
                  <Text size="2" style={{ color: "var(--gray-12)", fontWeight: 500 }}>
                    {item.name} <Text style={{ color: "var(--gray-9)", fontWeight: 400 }}>× {item.quantity}</Text>
                  </Text>
                  <Text size="2" weight="bold" style={{ color: "var(--gray-12)" }}>₹{item.price * item.quantity}</Text>
                </Flex>
              ))}
            </Flex>

            <Box
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px dashed var(--gray-6)",
              }}
            >
              <Flex justify="between" mb="2">
                <Text size="2" style={{ color: "var(--gray-10)" }}>Subtotal</Text>
                <Text size="2" weight="medium" style={{ color: "var(--gray-11)" }}>₹{safePricing.subtotal}</Text>
              </Flex>

              {safePricing.discount > 0 && (
                <Flex justify="between" mb="2">
                  <Text size="2" style={{ color: "var(--gray-10)" }}>Discount</Text>
                  <Text size="2" weight="bold" style={{ color: "var(--red-9)" }}>
                    -₹{safePricing.discount}
                  </Text>
                </Flex>
              )}

              {safePricing.gstAmount > 0 && (
                <Flex justify="between" mb="3">
                  <Text size="2" style={{ color: "var(--gray-10)" }}>GST Amount</Text>
                  <Text size="2" weight="medium" style={{ color: "var(--gray-11)" }}>
                    +₹{safePricing.gstAmount}
                  </Text>
                </Flex>
              )}

              <Flex justify="between" mt="4" align="center">
                <Text size="3" weight="bold" style={{ color: "var(--gray-12)" }}>Total Due</Text>
                <Text size="7" weight="bold" style={{ color: "var(--green-10)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  ₹{safePricing.total}
                </Text>
              </Flex>
            </Box>
          </Box>

          {/* CUSTOMER FIELDS - Grid Layout like DynamicForm */}
          <Grid columns="2" gap="4" mb="5">
            <Box>
              <Text as="label" size="2" weight="medium" style={{ marginBottom: "8px", display: "block", color: "var(--gray-12)" }}>
                Customer Name <Text color="red">*</Text>
              </Text>
              <TextField.Root
                placeholder="Enter name"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (error) setError(null);
                }}
                size="3"
                radius="medium"
                variant="surface"
                style={{
                  fontSize: 14,
                  borderColor: error && !customerName.trim() ? "var(--red-7)" : "var(--gray-5)",
                  boxShadow: "none",
                  backgroundColor: "var(--gray-1)"
                }}
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" style={{ marginBottom: "8px", display: "block", color: "var(--gray-12)" }}>
                Phone <Text color="red">*</Text>
              </Text>
              <TextField.Root
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  if (error) setError(null);
                }}
                size="3"
                radius="medium"
                variant="surface"
                style={{
                  fontSize: 14,
                  borderColor: error && (!phone.trim() || !/^\d{10}$/.test(phone.trim())) ? "var(--red-7)" : "var(--gray-5)",
                  boxShadow: "none",
                  backgroundColor: "var(--gray-1)"
                }}
              />
            </Box>
          </Grid>

          {/* ORDER TYPE */}
          <Box mb="5">
            <Text as="label" size="2" weight="medium" style={{ marginBottom: "12px", display: "block", color: "var(--gray-12)" }}>
              Order Type
            </Text>
            <Grid columns="4" gap="3">
              {orderTypeOptions.map((btn) => {
                const isSelected = orderType === btn.value;
                return (
                  <button
                    key={btn.value}
                    type="button"
                    onClick={() => setOrderType(btn.value)}
                    style={{
                      height: 72,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      borderRadius: "14px",
                      border: isSelected ? "1.5px solid var(--accent-9)" : "1px solid var(--gray-5)",
                      background: isSelected ? "var(--accent-2)" : "var(--gray-1)",
                      color: isSelected ? "var(--accent-11)" : "var(--gray-11)",
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: isSelected ? "0 4px 12px rgba(var(--accent-a-rgb), 0.1)" : "0 1px 2px rgba(0,0,0,0.02)",
                      outline: "none"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "var(--gray-7)";
                        e.currentTarget.style.background = "var(--gray-2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "var(--gray-5)";
                        e.currentTarget.style.background = "var(--gray-1)";
                      }
                    }}
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                );
              })}
            </Grid>
          </Box>

          {/* PAYMENT METHOD */}
          <Box mb="6">
            <Text as="label" size="2" weight="medium" style={{ marginBottom: "12px", display: "block", color: "var(--gray-12)" }}>
              Payment Method
            </Text>
            <Grid columns="4" gap="3">
              {paymentOptions.map((btn) => {
                 const isSelected = paymentMethod === btn.value;
                 return (
                  <button
                    key={btn.value}
                    type="button"
                    onClick={() => setPaymentMethod(btn.value)}
                    style={{
                      height: 48,
                      borderRadius: "12px",
                      border: isSelected ? "1.5px solid var(--accent-9)" : "1px solid var(--gray-5)",
                      background: isSelected ? "var(--accent-2)" : "var(--gray-1)",
                      color: isSelected ? "var(--accent-11)" : "var(--gray-11)",
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: isSelected ? "0 4px 12px rgba(var(--accent-a-rgb), 0.1)" : "0 1px 2px rgba(0,0,0,0.02)",
                      outline: "none"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "var(--gray-7)";
                        e.currentTarget.style.background = "var(--gray-2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "var(--gray-5)";
                        e.currentTarget.style.background = "var(--gray-1)";
                      }
                    }}
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                );
              })}
            </Grid>
          </Box>

          {/*  NOTES */}
          <Box mb="6">
            <Text as="label" size="2" weight="medium" style={{ marginBottom: "10px", display: "block", color: "var(--gray-12)" }}>
              Notes <Text color="gray" weight="regular" size="1">(Optional)</Text>
            </Text>
            <TextArea
              placeholder="Any special instructions for the kitchen or order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              size="3"
              radius="medium"
              variant="surface"
              style={{
                fontSize: 14,
                width: "100%",
                resize: "vertical",
                boxShadow: "none",
                borderColor: "var(--gray-5)",
                backgroundColor: "var(--gray-1)"
              }}
            />
          </Box>

          {/*  ACTIONS */}
          <Flex mt="4" pt="4" gap="3" style={{ borderTop: "1px solid var(--gray-4)" }}>
            <Dialog.Close>
              <Button
                variant="soft" color="gray"
                style={{ 
                  flex: "0 0 auto", 
                  padding: "0 24px", 
                  height: 48, 
                  borderRadius: 14, 
                  fontSize: 15, 
                  cursor: "pointer", 
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
                cursor: "pointer", 
                background: "var(--accent-9)", 
                color: "white", 
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(var(--accent-9-rgb), 0.2)",
                transition: "transform 0.1s ease" 
              }}
              onClick={handleCompleteOrder}
              disabled={loading}
              onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = "scale(0.98)" }}
              onMouseUp={(e) => { if (!loading) e.currentTarget.style.transform = "scale(1)" }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.transform = "scale(1)" }}
            >
              <Check size={18} strokeWidth={2.5} />
              {loading ? "Processing..." : `Complete Order · ₹${safePricing.total}`}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* CUSTOM TOAST NOTIFICATIONS */}
      <Toast
        open={toastOpen}
        onOpenChange={setToastOpen}
        title={toastMessage.title}
        description={toastMessage.description}
        variant={toastVariant}
      />
      <ToastViewport />
    </ToastProvider>
  );
};