import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { RootState, AppDispatch } from "../../store/Store";
import { fetchSettings, updateSettings } from "../../features/SettingsSlice";
import { RotateCcw, Save, Percent } from "lucide-react";
import { Toast, ToastProvider, ToastViewport } from "../../components/Toast";
import DynamicAlertDialog from "../../components/dynamicComponents/DynamicAlertDialog";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const { gstRate, discountType, discountValue, loading } = useSelector(
    (state: RootState) => state.settings
  );

  const [localGst, setLocalGst] = useState(gstRate.toString());
  const [localDiscountType, setLocalDiscountType] = useState<
    "percentage" | "flat"
  >(discountType);
  const [localDiscount, setLocalDiscount] = useState(discountValue.toString());

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    description: "",
  });
  const [toastVariant, setToastVariant] = useState<
    "success" | "error" | "info"
  >("success");

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    setLocalGst(gstRate.toString());
    setLocalDiscountType(discountType);
    setLocalDiscount(discountValue.toString());
  }, [gstRate, discountType, discountValue]);

  const isDirty = useMemo(() => {
    const g = Number(localGst) || 0;
    const d = Number(localDiscount) || 0;
    return (
      g !== gstRate ||
      localDiscountType !== discountType ||
      d !== discountValue
    );
  }, [
    localGst,
    localDiscount,
    localDiscountType,
    gstRate,
    discountType,
    discountValue,
  ]);

  const handleReset = () => {
    setLocalGst("0");
    setLocalDiscount("0");
  };

  const resetDisabled =
    (Number(localGst) || 0) === 0 && (Number(localDiscount) || 0) === 0;

  const handleSave = async () => {
    try {
      await dispatch(
        updateSettings({
          gstRate: Number(localGst) || 0,
          discountType: localDiscountType,
          discountValue: Number(localDiscount) || 0,
        })
      ).unwrap();

      setToastVariant("success");
      setToastMessage({
        title: "Success",
        description:
          "Settings saved successfully! These rules will now apply globally.",
      });
      setToastOpen(true);
    } catch (e: any) {
      setToastVariant("error");
      setToastMessage({
        title: "Error",
        description: e || "Failed to save settings.",
      });
      setToastOpen(true);
    }
  };

  const inputSurfaceStyle: React.CSSProperties = {
    maxWidth: 300,
    fontSize: 15,
    backgroundColor: "var(--gray-1)",
    borderColor: "var(--gray-5)",
    boxShadow: "none",
    color: "var(--gray-12)",
  };

  return (
    <ToastProvider>
      <Box p={{ initial: "4", sm: "6" }} style={{ maxWidth: 800, margin: "0 auto" }}>
        <Heading size="7" mb="2" style={{ color: "var(--gray-12)" }}>
          Global Settings
        </Heading>
        <Text size="3" color="gray" mb="6" as="p" style={{ maxWidth: 560 }}>
          Configure standard rules that automatically apply during the checkout
          process in the POS and Digital Menu.
        </Text>

        <Card size="3" variant="surface">
          {loading ? (
            <Box py="6" style={{ textAlign: "center" }}>
              <Text color="gray">Loading settings…</Text>
            </Box>
          ) : (
            <Flex direction="column" gap="6" p={{ initial: "3", sm: "4" }}>
              <Box>
                <Text
                  as="label"
                  size="2"
                  weight="medium"
                  mb="2"
                  style={{ display: "block", color: "var(--gray-12)" }}
                >
                  Global GST Rate (%)
                </Text>
                <TextField.Root
                  value={localGst}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d*$/.test(val)) setLocalGst(val);
                  }}
                  size="3"
                  radius="medium"
                  variant="surface"
                  style={inputSurfaceStyle}
                >
                  <TextField.Slot side="right">
                    <Percent
                      size={18}
                      strokeWidth={2}
                      style={{ color: "var(--gray-9)" }}
                    />
                  </TextField.Slot>
                </TextField.Root>
                <Text size="1" color="gray" mt="2" as="p">
                  This percentage is calculated from the subtotal before
                  discount.
                </Text>
              </Box>

              <Separator size="4" />

              <Box>
                <Text
                  as="label"
                  size="2"
                  weight="medium"
                  mb="3"
                  style={{ display: "block", color: "var(--gray-12)" }}
                >
                  Global Discount Policy
                </Text>

                <Flex gap="3" wrap="wrap" mb="4" style={{ maxWidth: 420 }}>
                  <Button
                    type="button"
                    size="3"
                    variant={
                      localDiscountType === "percentage" ? "solid" : "soft"
                    }
                    highContrast={localDiscountType === "percentage"}
                    onClick={() => setLocalDiscountType("percentage")}
                    style={{ flex: "1 1 140px" }}
                  >
                    Percentage (%)
                  </Button>
                  <Button
                    type="button"
                    size="3"
                    variant={localDiscountType === "flat" ? "solid" : "soft"}
                    highContrast={localDiscountType === "flat"}
                    onClick={() => setLocalDiscountType("flat")}
                    style={{ flex: "1 1 140px" }}
                  >
                    Flat Amount (₹)
                  </Button>
                </Flex>

                <TextField.Root
                  value={localDiscount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d*$/.test(val)) setLocalDiscount(val);
                  }}
                  size="3"
                  radius="medium"
                  variant="surface"
                  style={inputSurfaceStyle}
                >
                  {localDiscountType === "flat" && (
                    <TextField.Slot side="left">
                      <Text weight="bold" style={{ color: "var(--gray-11)" }}>
                        ₹
                      </Text>
                    </TextField.Slot>
                  )}
                  {localDiscountType === "percentage" && (
                    <TextField.Slot side="right">
                      <Percent
                        size={18}
                        strokeWidth={2}
                        style={{ color: "var(--gray-9)" }}
                      />
                    </TextField.Slot>
                  )}
                </TextField.Root>
                <Text size="1" color="gray" mt="2" as="p">
                  {localDiscountType === "percentage"
                    ? "Example: 10% off the entire gross subtotal."
                    : "Example: ₹50 subtracted from the final total."}
                </Text>
              </Box>

              <Flex
                gap="3"
                justify="end"
                wrap="wrap"
                pt="2"
                style={{ borderTop: "1px solid var(--gray-5)" }}
              >
                <DynamicAlertDialog
                  title="Reset form values?"
                  description="This will set the GST rate and discount value to 0 in the form. Nothing is saved until you click Save Global Settings."
                  cancelText="Cancel"
                  actionText="Reset"
                  onAction={handleReset}
                >
                  <Button
                    type="button"
                    size="3"
                    variant="soft"
                    disabled={resetDisabled}
                  >
                    <RotateCcw size={18} />
                    Reset
                  </Button>
                </DynamicAlertDialog>
                <DynamicAlertDialog
                  title="Save global settings?"
                  description="These GST and discount rules will apply to checkout in the POS and Digital Menu for all users."
                  cancelText="Cancel"
                  actionText="Save"
                  onAction={handleSave}
                >
                  <Button
                    type="button"
                    size="3"
                    variant="solid"
                    disabled={!isDirty}
                  >
                    <Save size={18} />
                    Save Global Settings
                  </Button>
                </DynamicAlertDialog>
              </Flex>
            </Flex>
          )}
        </Card>
      </Box>

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
}
