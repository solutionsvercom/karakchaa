import { useNavigate } from "react-router-dom";
import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

type ProductField =
  | "image"
  | "name"
  | "sku"
  | "category"
  | "sellingPrice"
  | "costPrice"
  | "stockQty"
  | "minStock"
  | "unit"
  | "description"
  | "active";

interface AddProductsProps {
  mode: "create" | "edit";
  initialValues?: Partial<Record<ProductField, any>>;
}

const AddProducts = ({ mode, initialValues }: AddProductsProps) => {
  const navigate = useNavigate();

  const fields: FormField<ProductField>[] = [
    { name: "image", label: "Product Image", type: "file", span: 2 },
    {
      name: "name",
      label: "Product Name",
      type: "text",
      required: true,
      span: 2,
      placeholder: "Enter product name",
    },
    { name: "sku", label: "SKU", type: "text", placeholder: "e.g. BEV-001" },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      placeholder: "Select category",
      options: [
        { label: "Beverages", value: "beverages" },
        { label: "Snacks", value: "snacks" },
        { label: "Meals", value: "meals" },
        { label: "Desserts", value:"desserts"},
        { label: "Other", value:"other"}
      ],
    },
    { name: "sellingPrice", label: "Selling Price (₹)", type: "number" },
    { name: "costPrice", label: "Cost Price (₹)", type: "number" },
    { name: "stockQty", label: "Stock Qty", type: "number", group: "triple" },
    { name: "minStock", label: "Min Stock", type: "number", group: "triple" },
    {
      name: "unit",
      label: "Unit",
      type: "select",
      required: true,
      placeholder: "Select unit",
      group: "triple",
      options: [
        { label: "Piece", value: "piece" },
        { label: "Kilogram", value: "kg" },
        { label: "Gram", value: "g" },
        { label: "Liter", value: "l" },
        { label: "Milliliter", value: "ml" },
        { label: "Pack", value: "pack" },
      ],
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      span: 2,
      rows: 2,
      placeholder: "Enter product description...",
    },
    { name: "active", label: "Active Product", type: "switch", span: 2 },
  ];

  return (
    <DynamicForm
      title={mode === "create" ? "Add New Product" : "Edit Product"}
      fields={fields}
      initialValues={initialValues}
      submitText={mode === "create" ? "Create" : "Update"}
      cancelText="Cancel"
      onCancel={() => navigate("/dashboard/products")}
      confirm={{
        title: "Are you absolutely sure?",
        description:
          mode === "create"
            ? "This will create a new product."
            : "This will update the product.",
        confirmText: mode === "create" ? "Yes, Create" : "Yes, Update",
        cancelText: "No, go back",
      }}
      onSubmit={(data) => {
        if (mode === "create") {
          console.log("Create product:", data);
        } else {
          console.log("Update product:", data);
        }
        navigate("/dashboard/products");
      }}
    />
  );
};

export default AddProducts;