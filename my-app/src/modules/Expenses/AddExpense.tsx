import React from "react";
import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import {
  createExpense,
  updateExpense,
  fetchExpenseTotals,
  fetchExpenses,
} from "../../features/ExpensesSlice";

interface AddExpensesProps {
  mode: "create" | "edit";
  initialValues?: any;
  onClose?: () => void; // ✅ added
}

type ExpenseField =
  | "title"
  | "category"
  | "amount"
  | "paymentMethod"
  | "date"
  | "vendor"
  | "notes";

function toDateObject(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

const AddExpense = ({ mode, initialValues, onClose }: AddExpensesProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const close = () => {
    if (onClose) onClose();
    else navigate("/dashboard/expenses");
  };

  const fields: FormField<ExpenseField>[] = [
    { name: "title", label: "Title", type: "text", required: true, span: 2, placeholder: "e.g., Monthly Rent" },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      span: 1,
      options: [
        { label: "Miscellaneous", value: "misc" },
        { label: "Rent", value: "rent" },
        { label: "Salary", value: "salary" },
        { label: "Utilities", value: "utilities" },
        { label: "Supplies", value: "supplies" },
        { label: "Inventory", value: "inventory" },
        { label: "Marketing", value: "marketing" },
        { label: "Maintenance", value: "maintenance" },
        { label: "Transport", value: "transport" },
        { label: "Taxes", value: "taxes" },
      ],
    },
    { name: "amount", label: "Amount (₹)", type: "number", required: true, span: 1, placeholder: "0.00" },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      required: true,
      span: 1,
      options: [
        { label: "Cash", value: "cash" },
        { label: "UPI", value: "upi" },
        { label: "Bank Transfer", value: "bank" },
      ],
    },
    // ✅ DatePicker expects Date object (not string)
    { name: "date", label: "Date", type: "date", required: true, span: 1 },
    { name: "vendor", label: "Vendor / Payee", type: "text", span: 2, placeholder: "Enter vendor name" },
    { name: "notes", label: "Notes", type: "textarea", span: 2, placeholder: "Additional notes" },
  ];

  // ✅ Normalize initialValues so edit always fills and DatePicker never crashes
  const normalizedInitialValues = React.useMemo(() => {
    if (mode !== "edit" || !initialValues) return initialValues;
    return {
      ...initialValues,
      date: toDateObject(initialValues.date),
      vendor: initialValues.vendor ?? "",
      notes: initialValues.notes ?? "",
    };
  }, [initialValues, mode]);

  // ✅ Remount for each edited row
  const formKey = mode === "edit" ? normalizedInitialValues?._id ?? "edit" : "create";

  return (
    <DynamicForm
      key={formKey}
      title={mode === "edit" ? "Edit Expense" : "Add Expense"}
      fields={fields}
      initialValues={normalizedInitialValues}
      submitText={mode === "edit" ? "Update" : "Create"}
      cancelText="Cancel"
      onCancel={close}
      confirm={{
        title: mode === "edit" ? "Are you sure you want to update?" : "Are you absolutely sure?",
        description: mode === "edit" ? "This will update the expense details." : "This action cannot be undone.",
        confirmText: mode === "edit" ? "Yes, Update" : "Yes, Create",
        cancelText: "No, go back",
      }}
      onSubmit={async (data) => {
        const dateObj = toDateObject((data as any).date);

        const payload = {
          ...data,
          amount: Number((data as any).amount),
          date: dateObj.toISOString(), // ✅ backend expects ISO string
          vendor: (data as any).vendor ?? "",
          notes: (data as any).notes ?? "",
        };

        if (mode === "create") {
          const res = await dispatch(createExpense(payload));
          if (createExpense.fulfilled.match(res)) {
            dispatch(fetchExpenses());
            dispatch(fetchExpenseTotals());
            close();
          }
          return;
        }

        const expenseId = normalizedInitialValues?._id;
        if (!expenseId) {
          console.error("Missing _id for update");
          return;
        }

        const res = await dispatch(updateExpense({ id: expenseId, payload }));
        if (updateExpense.fulfilled.match(res)) {
          dispatch(fetchExpenses());
          dispatch(fetchExpenseTotals());
          close();
        }
      }}
    />
  );
};

export default AddExpense;
