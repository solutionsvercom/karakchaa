import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/Store";
import { clearError } from "../../features/ProductsSlice";
import { useEffect } from "react";

import {
  createProduct,
  updateProduct,
} from "../../features/ProductsSlice";

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
  initialValues?: any;
}

const AddProducts = ({ mode, initialValues }: AddProductsProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
  dispatch(clearError());

  return () => {
    dispatch(clearError());
  };
}, [dispatch]);

  /* ⭐ READ ERROR FROM REDUX SLICE */
  const { error } = useSelector((state: RootState) => state.product);

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
        { label: "Desserts", value: "desserts" },
        { label: "Other", value: "other" },
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

  /* ⭐ MAP BACKEND FIELD → FORM FIELD */
  const mappedInitialValues = initialValues
    ? {
        ...initialValues,
        active: initialValues.isActive,
      }
    : undefined;

  return (
    <>
      {/* ⭐ ERROR UI WITHOUT TOUCHING DynamicForm */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "8px 12px",
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <DynamicForm
        title={mode === "create" ? "Add New Product" : "Edit Product"}
        fields={fields}
        initialValues={mappedInitialValues}
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
        onSubmit={async (data) => {
          try {
            const payload = {
              name: data.name,
              sku: data.sku,
              category: data.category,
              sellingPrice: Number(data.sellingPrice),
              costPrice: Number(data.costPrice),
              stockQty: Number(data.stockQty),
              minStock: Number(data.minStock),
              unit: data.unit,
              description: data.description,
              isActive: data.active ?? true,
            };

            if (mode === "create") {
              await dispatch(createProduct(payload)).unwrap();
            } else if (mode === "edit" && initialValues?._id) {
              await dispatch(
                updateProduct({
                  id: initialValues._id,
                  payload,
                })
              ).unwrap();
            }

            navigate("/dashboard/products");
          } catch (err) {
            console.error("❌ Product save failed:", err);
          }
        }}
      />
    </>
  );
};

export default AddProducts;
