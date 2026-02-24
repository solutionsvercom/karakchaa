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
  | "active"
  | "isVeg";

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
        { label: "Drinks", value: "drinks" },
        { label: "Starters", value: "starters" },
        { label: "Breads", value: "breads" },
        { label: "Pizza", value: "pizza" },
        { label: "Sandwich", value: "sandwich" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "sellingPrice", label: "Selling Price (₹)", type: "number" },
    { name: "costPrice", label: "Cost Price (₹)", type: "number" },
    { 
      name: "stockQty", 
      label: "Stock Qty", 
      type: "number", 
      group: "triple", 
      disabled: mode === "edit" 
    },
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
    { name: "isVeg", label: "🟩 Veg Product", type: "switch", span: 2 },
    { name: "active", label: "Active Product", type: "switch", span: 2 },
  ];

  /* MAP BACKEND FIELD → FORM FIELD */
  const mappedInitialValues = initialValues
    ? {
        ...initialValues,
        active: initialValues.isActive,
        isVeg: initialValues.isVeg !== undefined ? initialValues.isVeg : true,
        image: initialValues.image?.url ?? null,
      }
    : undefined;

  return (
    <>
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
            const formData = new FormData();

            formData.append("name", data.name);
            formData.append("sku", data.sku);
            formData.append("category", data.category);
            formData.append("sellingPrice", String(Number(data.sellingPrice)));
            formData.append("costPrice", String(Number(data.costPrice)));
            
            // Only append stockQty in create mode
            if (mode === "create") {
              formData.append("stockQty", String(Number(data.stockQty)));
            }
            
            formData.append("minStock", String(Number(data.minStock)));
            formData.append("unit", data.unit);
            formData.append("description", data.description || "");
            formData.append(
              "isActive",
              String(data.active !== undefined ? data.active : true)
            );
            formData.append(
              "isVeg",
              String(data.isVeg !== undefined ? data.isVeg : true)
            );

            // Handle image upload/removal
            if (data.image instanceof File) {
              formData.append("image", data.image);
            } else if (data.image === null || data.image === "") {
              formData.append("removeImage", "true");
            }

            if (mode === "create") {
              await dispatch(createProduct(formData)).unwrap();
            } else if (mode === "edit" && initialValues?._id) {
              await dispatch(
                updateProduct({
                  id: initialValues._id,
                  payload: formData,
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