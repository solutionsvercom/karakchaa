import { Flex, Button, Callout } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/Store";
import {
  addStock,
  removeStock,
  fetchStockItems,
  fetchStockStats,
  clearError,
} from "../../features/StockmanagementSlice";
import { fetchProducts } from "../../features/ProductsSlice"; // ✅ auto-refresh products
import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

/*  TYPES  */

type StockFormField =
  | "quantity"
  | "reason"
  | "supplier"
  | "unitCost"
  | "reference"
  | "notes";

type StockMode = "add" | "remove";

interface AddStockProps {
  mode: StockMode;
  productId: string;
  product: {
    name: string;
    stock: number;
    unit: string;
  };
}

/*  COMPONENT  */

export default function AddStock({ mode, productId, product }: AddStockProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedReason, setSelectedReason] = useState<string>("");

  // Local validation error (shown when reason is missing)
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get error from Redux state
  const error = useSelector((state: RootState) => state.stock.error);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // DYNAMIC FIELDS FUNCTION
  const getFields = (): FormField<StockFormField>[] => {
    const baseFields: FormField<StockFormField>[] = [
      {
        name: "quantity",
        label: "Quantity",
        type: "number",
        required: true,
        placeholder: "Enter quantity",
        span: 2,
      },
      {
        name: "reason",
        label: "Reason",
        type: "select",
        required: true,
        placeholder: "Select reason",
        span: 2,
        options:
          mode === "add"
            ? [
                { label: "Purchase", value: "purchase" },
                { label: "Adjustment", value: "adjustment" },
                { label: "Return", value: "return" },
              ]
            : [
                { label: "Sale", value: "sale" },
                { label: "Damage", value: "damage" },
                { label: "Adjustment", value: "adjustment" },
              ],
      },
    ];

    // ADD SUPPLIER AND UNIT COST ONLY IF REASON IS "PURCHASE" AND MODE IS "ADD"
    if (mode === "add" && selectedReason === "purchase") {
      baseFields.push(
        {
          name: "supplier",
          label: "Supplier",
          type: "select",
          placeholder: "Select supplier",
          span: 2,
          options: [
            { label: "Fresh Foods Guwahati", value: "supplier_a" },
            { label: "Assam Tea Distributors", value: "supplier_b" },
            { label: "Bakery Supplies Co", value: "supplier_c" },
          ],
        },
        {
          name: "unitCost",
          label: "Unit Cost (₹)",
          type: "number",
          placeholder: "0.00",
          span: 2,
        }
      );
    }

    // ADD REFERENCE AND NOTES AT THE END
    baseFields.push(
      {
        name: "reference",
        label: "Reference / Invoice No.",
        type: "text",
        placeholder: "e.g. INV-001",
        span: 2,
      },
      {
        name: "notes",
        label: "Notes",
        type: "textarea",
        placeholder: "Additional notes...",
        rows: 2,
        span: 2,
      }
    );

    return baseFields;
  };

  return (
    <Flex direction="column" gap="4">
      {/* TITLE  */}
      <Flex justify="between" align="center" mb="4">
        <h3 style={{ margin: 0 }}>
          {mode === "add" ? "Add Stock Details" : "Remove Stock Details"}
        </h3>
        <Dialog.Close asChild>
          <Button variant="ghost">
            <X size={18} />
          </Button>
        </Dialog.Close>
      </Flex>

      {/*  VALIDATION ERROR (missing reason)  */}
      {validationError && (
        <Callout.Root color="orange" style={{ marginBottom: "8px" }}>
          <Callout.Text>{validationError}</Callout.Text>
        </Callout.Root>
      )}

      {/*  REDUX ERROR (server error)  */}
      {error && (
        <Callout.Root color="red" style={{ marginBottom: "8px" }}>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {/* PRODUCT INFO CARD  */}
      <div
        style={{
          display: "inline-block",
          alignSelf: "flex-start",
          padding: 16,
          borderRadius: 10,
          border: "1px solid #474c55",
        }}
      >
        <div style={{ fontWeight: 400 }}>{product.name}</div>
        <div style={{ color: "#64748b", fontSize: 14 }}>
          Current Stock: {product.stock} {product.unit}
        </div>
      </div>

      {/*  FORM */}
      <DynamicForm
        fields={getFields()}
        submitText={mode === "add" ? "Add Stock" : "Remove Stock"}
        cancelText="Cancel"
        onCancel={() => {
          dispatch(clearError());
          setValidationError(null);
          navigate("/dashboard/stockmanagement");
        }}
        confirm={{
          title:
            mode === "add"
              ? "Confirm Stock Addition"
              : "Confirm Stock Removal",
          description:
            mode === "add"
              ? "This will increase the stock quantity."
              : "This will decrease the stock quantity.",
          confirmText: mode === "add" ? "Yes, Add" : "Yes, Remove",
          cancelText: "Cancel",
        }}
        onSubmit={async (data) => {
          //FRONTEND VALIDATION: block submit if reason not selected
          if (!data.reason || data.reason === "") {
            setValidationError("Please select a reason before submitting.");
            return; // stop — don't call API
          }

          if (!data.quantity || Number(data.quantity) <= 0) {
            setValidationError("Quantity must be greater than zero.");
            return;
          }

          setValidationError(null);

          try {
            dispatch(clearError());

            const payload = {
              id: productId,
              quantity: Number(data.quantity),
              reason: data.reason,
              referenceNo: data.reference,
              notes: data.notes,
            };

            if (mode === "add") {
              await dispatch(addStock(payload)).unwrap();
            } else {
              await dispatch(removeStock(payload)).unwrap();
            }

            await dispatch(fetchStockItems());
            await dispatch(fetchStockStats());
            await dispatch(fetchProducts()); //refresh Products page stock numbers

            navigate("/dashboard/stockmanagement");
          } catch (error) {
            console.error("Failed:", error);
          }
        }}
        onFieldChange={(fieldName, value) => {
          if (fieldName === "reason") {
            setSelectedReason(value as string);
            // Clear validation error as soon as user selects a reason
            if (value) setValidationError(null);
          }
        }}
      />
    </Flex>
  );
}