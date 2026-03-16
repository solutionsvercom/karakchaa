import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { fetchSettings, updateSettings } from "../../features/SettingsSlice";
import { Save, Plus, Percent } from "lucide-react";
import { Toast, ToastProvider, ToastViewport } from "../../components/Toast";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    gstRate,
    discountType,
    discountValue,
    loading,
  } = useSelector((state: RootState) => state.settings);

  const [localGst, setLocalGst] = useState(gstRate.toString());
  const [localDiscountType, setLocalDiscountType] = useState<"percentage" | "flat">(discountType);
  const [localDiscount, setLocalDiscount] = useState(discountValue.toString());

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", description: "" });
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "info">("success");

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Sync state when redux finishes loading
  useEffect(() => {
    setLocalGst(gstRate.toString());
    setLocalDiscountType(discountType);
    setLocalDiscount(discountValue.toString());
  }, [gstRate, discountType, discountValue]);

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
      setToastMessage({ title: "Success", description: "Settings saved successfully! These rules will now apply globally." });
      setToastOpen(true);
    } catch (e: any) {
      setToastVariant("error");
      setToastMessage({ title: "Error", description: e || "Failed to save settings." });
      setToastOpen(true);
    }
  };

  return (
    <ToastProvider>
      <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto", fontFamily: "var(--font-family, system-ui, sans-serif)" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 8px 0", color: "#111827" }}>Global Settings</h1>
        <p style={{ color: "#6B7280", marginBottom: "32px" }}>
          Configure standard rules that automatically apply during the checkout process in the POS and Digital Menu.
        </p>

        <div style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
          padding: "32px"
        }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Loading settings...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* GST Rating */}
              <div>
                <label style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                  Global GST Rate (%)
                </label>
                <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                  <input
                    type="text"
                    value={localGst}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) setLocalGst(val);
                    }}
                    className="styled-input"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      paddingRight: "40px",
                      borderRadius: "8px",
                      border: "1px solid #D1D5DB",
                      fontSize: "16px",
                      outline: "none",
                      transition: "all 0.2s"
                    }}
                  />
                  <Percent size={18} color="#9CA3AF" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
                <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px" }}>This percentage is calculated from the subtotal before discount.</p>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "0" }} />

              {/* Discount Section */}
              <div>
                <label style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>
                  Global Discount Policy
                </label>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px", maxWidth: "400px" }}>
                  <button
                    onClick={() => setLocalDiscountType("percentage")}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: localDiscountType === "percentage" ? "2px solid #7c3aed" : "2px solid #E5E7EB",
                      background: localDiscountType === "percentage" ? "#F5F3FF" : "white",
                      color: localDiscountType === "percentage" ? "#6d28d9" : "#4B5563",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Percentage (%)
                  </button>
                  <button
                    onClick={() => setLocalDiscountType("flat")}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: localDiscountType === "flat" ? "2px solid #7c3aed" : "2px solid #E5E7EB",
                      background: localDiscountType === "flat" ? "#F5F3FF" : "white",
                      color: localDiscountType === "flat" ? "#6d28d9" : "#4B5563",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Flat Amount (₹)
                  </button>
                </div>

                <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                  <input
                    type="text"
                    value={localDiscount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) setLocalDiscount(val);
                    }}
                    className="styled-input"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      paddingLeft: localDiscountType === "flat" ? "32px" : "16px",
                      paddingRight: localDiscountType === "percentage" ? "40px" : "16px",
                      borderRadius: "8px",
                      border: "1px solid #D1D5DB",
                      fontSize: "16px",
                      outline: "none",
                      transition: "all 0.2s"
                    }}
                  />
                  {localDiscountType === "percentage" && (
                     <Percent size={18} color="#9CA3AF" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)" }} />
                  )}
                  {localDiscountType === "flat" && (
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#6B7280", fontWeight: 600 }}>₹</span>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px" }}>
                  {localDiscountType === "percentage" 
                    ? "Example: 10% off the entire gross subtotal."
                    : "Example: ₹50 subtracted from the final total."}
                </p>
              </div>

              {/* Save Button */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  onClick={handleSave}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "14px 24px",
                    fontWeight: 600,
                    fontSize: "16px",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)"
                  }}
                >
                  <Save size={20} />
                  Save Global Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
