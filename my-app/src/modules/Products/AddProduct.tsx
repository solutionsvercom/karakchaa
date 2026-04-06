import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/Store";
import { clearError } from "../../features/ProductsSlice";
import { useEffect, useMemo, useState } from "react";

import {
  createProduct,
  updateProduct,
} from "../../features/ProductsSlice";
import { fetchProductCategories } from "../../features/ProductCategoriesSlice";
import { categoryLabelForSlug } from "../../utils/categoryDisplay";

import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { Callout } from "@radix-ui/themes";

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

function validateProductForm(
  values: Record<string, unknown>,
  mode: "create" | "edit"
): string[] {
  const msgs: string[] = [];
  const name = String(values.name ?? "").trim();
  const sku = String(values.sku ?? "").trim();
  const category = String(values.category ?? "").trim();
  const unit = String(values.unit ?? "").trim();
  const sp = Number(values.sellingPrice);
  const cp = Number(values.costPrice);
  const mq = Number(values.minStock);
  const sq = Number(values.stockQty);

  if (!name) msgs.push("Product name is required.");
  if (!sku) msgs.push("SKU is required.");
  if (!category) msgs.push("Category is required.");
  if (!unit) msgs.push("Unit is required.");
  if (!Number.isFinite(sp) || sp < 0) {
    msgs.push("Selling price must be a valid number ≥ 0.");
  }
  if (!Number.isFinite(cp) || cp < 0) {
    msgs.push("Cost price must be a valid number ≥ 0.");
  }
  if (!Number.isFinite(mq) || mq < 0) {
    msgs.push("Min stock must be a valid number ≥ 0.");
  }
  if (mode === "create") {
    if (!Number.isFinite(sq) || sq < 0) {
      msgs.push("Stock quantity must be a valid number ≥ 0.");
    }
  }
  return msgs;
}

const AddProducts = ({ mode, initialValues }: AddProductsProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProductCategories({ includeInactive: false }));
  }, [dispatch]);

  const { error } = useSelector((state: RootState) => state.product);
  const { categories } = useSelector((state: RootState) => state.productCategories);

  const categoryOptions = useMemo(() => {
    const active = categories
      .filter((c) => c.isActive)
      .map((c) => ({ label: c.label, value: c.slug }));
    const slug = initialValues?.category;
    if (slug && !active.some((o) => o.value === slug)) {
      active.unshift({
        label: `${categoryLabelForSlug(slug, categories)} (inactive)`,
        value: slug,
      });
    }
    return active;
  }, [categories, initialValues?.category]);

  const fields: FormField<ProductField>[] = useMemo(
    () => [
    { name: "image", label: "Product Image", type: "file", span: 2 },
    {
      name: "name",
      label: "Product Name",
      type: "text",
      required: true,
      span: 2,
      placeholder: "Enter product name",
    },
    { name: "sku", label: "SKU", type: "text", required: true, placeholder: "e.g. BEV-001" },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      placeholder: "Select category",
      options:
        categoryOptions.length > 0
          ? categoryOptions
          : [{ label: "Loading categories…", value: "other" }],
    },
    { name: "sellingPrice", label: "Selling Price (₹)", type: "number", required: true },
    { name: "costPrice", label: "Cost Price (₹)", type: "number", required: true },
    {
      name: "stockQty",
      label: "Stock Qty",
      type: "number",
      required: true,
      group: "triple",
      disabled: mode === "edit",
    },
    { name: "minStock", label: "Min Stock", type: "number", required: true, group: "triple" },
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
    { name: "isVeg", label: "Veg Product", type: "switch", span: 2 },
    { name: "active", label: "Active Product", type: "switch", span: 2 },
    ],
    [categoryOptions, mode]
  );

  const mappedInitialValues = initialValues
    ? {
        ...initialValues,
        active: initialValues.isActive,
        isVeg: initialValues.isVeg !== undefined ? initialValues.isVeg : false,
        image: initialValues.image?.url ?? null,
      }
    : undefined;

  return (
    <>
      {validationError && (
        <Callout.Root color="orange" style={{ marginBottom: 12 }}>
          <Callout.Text>{validationError}</Callout.Text>
        </Callout.Root>
      )}
      {error && (
        <Callout.Root color="red" style={{ marginBottom: 12 }}>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
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
        onFieldChange={() => {
          setValidationError(null);
          dispatch(clearError());
        }}
        onBeforeSubmit={async (values) => {
          dispatch(clearError());
          setValidationError(null);
          const msgs = validateProductForm(values, mode);
          if (msgs.length) {
            setValidationError(msgs.join(" "));
            return false;
          }
          return true;
        }}
        onSubmit={async (data) => {
          try {
            const formData = new FormData();

            formData.append("name", data.name);
            formData.append("sku", data.sku);
            formData.append("category", data.category);
            formData.append("sellingPrice", String(Number(data.sellingPrice)));
            formData.append("costPrice", String(Number(data.costPrice)));

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
              String(data.isVeg !== undefined ? data.isVeg : false)
            );

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
          } catch {
            /* Rejected thunks set state.product.error; no console noise */
          }
        }}
      />
    </>
  );
};

export default AddProducts;
