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

const AddProducts = () => {
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
  ],
},
{
  name: "sellingPrice",
  label: "Selling Price (₹)",
  type: "number",
},
{
  name: "costPrice",
  label: "Cost Price (₹)",
  type: "number",
},

{
  name: "stockQty",
  label: "Stock Qty",
  type: "number",
  group: "triple",
},
{
  name: "minStock",
  label: "Min Stock",
  type: "number",
  group: "triple",
},
{
  name: "unit",
  label: "Unit",
  type: "select",
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
      placeholder: "Enter product description",
    },

    {
      name: "active",
      label: "Active Product",
      type: "switch",
      span: 2,
    },
  ];

  return (
    <DynamicForm
      fields={fields}
      onSubmit={(data) => console.log("Product:", data)}
    />
  );
};

export default AddProducts;
