import { Flex, Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useState } from "react"; //  ADD THIS
import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

/* ---------------- TYPES ---------------- */

type StockFormField =
  | "quantity"
  | "reason"
  | "supplier"      //  ADD THIS
  | "unitCost"      //  ADD THIS
  | "reference"
  | "notes";

type StockMode = "add" | "remove";

interface AddStockProps {
  mode: StockMode;
  product: {
    id: number;
    name: string;
    stock: number;
    unit: string;
  };
}

/* ---------------- COMPONENT ---------------- */

export default function AddStock({ mode, product }: AddStockProps) {
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState<string>(""); //  ADD THIS

  //  DYNAMIC FIELDS FUNCTION
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

    //  ADD SUPPLIER AND UNIT COST ONLY IF REASON IS "PURCHASE" AND MODE IS "ADD"
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

    //  ADD REFERENCE AND NOTES AT THE END
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
      {/* ===== TITLE ===== */}
      <Flex justify="between" align="center" mb="4">
        <h3 style={{ margin: 0 }}>
          {mode === "add" ? "Add Stock Details" : "Remove Stock Details"}
        </h3>
        <Dialog.Close asChild>
          <Button className="dialog-close-icon">
            <X size={18} />
          </Button>
        </Dialog.Close>
      </Flex>

      {/* ===== PRODUCT INFO CARD ===== */}
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

      {/* ===== FORM ===== */}
      <DynamicForm
        fields={getFields()} //  NOW DYNAMIC
        submitText={mode === "add" ? "Add Stock" : "Remove Stock"}
        cancelText="Cancel"
        onCancel={() => navigate("/dashboard/stock")}
        onSubmit={(data) => {
          console.log(mode === "add" ? "ADD STOCK" : "REMOVE STOCK", data);
          navigate("/dashboard/stock");
        }}
        //  ADD THIS TO TRACK REASON CHANGES
        onFieldChange={(fieldName, value) => {
          if (fieldName === "reason") {
            setSelectedReason(value as string);
          }
        }}
      />
    </Flex>
  );
}