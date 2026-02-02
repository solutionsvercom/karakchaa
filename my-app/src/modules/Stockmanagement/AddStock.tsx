import { Flex,Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
/* ---------------- TYPES ---------------- */

type StockFormField =
  | "quantity"
  | "reason"
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

/* ---------------- FORM CONFIG ---------------- */

const getFields = (mode: StockMode): FormField<StockFormField>[] => [
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
  },
];

/* ---------------- COMPONENT ---------------- */

export default function AddStock({ mode, product }: AddStockProps) {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="4">
      {/* ===== TITLE ===== */}
      <Flex justify="between" align="center" mb="4">
         <h3 style={{ margin: 0 }}>
        {mode === "add" ? "Add Stock Details" : "Remove Stock Details "}
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
        fields={getFields(mode)}
        submitText={mode === "add" ? "Add Stock" : "Remove Stock"}
        cancelText="Cancel"
        onCancel={() => navigate("/dashboard/stock")}
        onSubmit={(data) => {
          console.log(
            mode === "add" ? "ADD STOCK" : "REMOVE STOCK",
            data
          );
          navigate("/dashboard/stock");
        }}
      />
    </Flex>
  );
}