import { Flex } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

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
    group: "triple",
  },
  {
    name: "reason",
    label: "Reason",
    type: "select",
    required: true,
    placeholder: "Select reason",
    group: "triple",
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
    group: "triple",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Additional notes...",
    rows: 3,
    group: "triple",
  },
];

/* ---------------- COMPONENT ---------------- */

export default function AddStock({ mode, product }: AddStockProps) {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="4">
      {/* ===== TITLE ===== */}
      <h2 style={{ margin: 0 }}>
        {mode === "add" ? "Add Stock" : "Remove Stock"}
      </h2>

      {/* ===== PRODUCT INFO CARD ===== */}
      <div
        style={{
          padding: 16,
          borderRadius: 10,
          background: "#f8fafc",
        }}
      >
        <div style={{ fontWeight: 600 }}>{product.name}</div>
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