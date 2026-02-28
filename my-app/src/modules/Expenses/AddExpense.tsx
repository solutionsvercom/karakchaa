import React, { useState } from "react";
import { Callout } from "@radix-ui/themes";
import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  createExpense, updateExpense, fetchExpenseTotals, fetchExpenses,
} from "../../features/ExpensesSlice";

interface AddExpensesProps {
  mode: "create" | "edit";
  initialValues?: any;
  onClose?: () => void;
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
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setError(null);
    if (onClose) onClose();
    else navigate("/dashboard/expenses");
  };

  const fields: FormField<ExpenseField>[] = [
    { name: "title", label: "Title", type: "text", required: true, span: 2, placeholder: "e.g., Monthly Rent" },
    {
      name: "category", label: "Category", type: "select", required: true, span: 1,
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
      name: "paymentMethod", label: "Payment Method", type: "select", required: true, span: 1,
      options: [
        { label: "Cash", value: "cash" },
        { label: "UPI", value: "upi" },
        { label: "Bank Transfer", value: "bank" },
      ],
    },
    { name: "date", label: "Date", type: "date", required: true, span: 1 },
    { name: "vendor", label: "Vendor / Payee", type: "text", span: 2, placeholder: "Enter vendor name" },
    { name: "notes", label: "Notes", type: "textarea", span: 2, placeholder: "Additional notes" },
  ];

  const normalizedInitialValues = React.useMemo(() => {
    if (mode !== "edit" || !initialValues) return initialValues;
    return {
      ...initialValues,
      date: toDateObject(initialValues.date),
      vendor: initialValues.vendor ?? "",
      notes: initialValues.notes ?? "",
    };
  }, [initialValues, mode]);

  const formKey = mode === "edit" ? normalizedInitialValues?._id ?? "edit" : "create";

  return (
    <>
      {error && (
        <Callout.Root color="red" style={{ marginBottom: "16px" }}>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

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
          setError(null);

          // Title validation
          if (!data.title?.trim()) {
            setError("Title is required");
            return;
          }

          // Category validation
          if (!data.category) {
            setError("Please select a category");
            return;
          }

          // Amount validation
          const amount = Number(data.amount);
          if (!data.amount || isNaN(amount)) {
            setError("Amount is required");
            return;
          }
          if (amount <= 0) {
            setError("Amount must be greater than 0");
            return;
          }

          // Payment method validation
          if (!data.paymentMethod) {
            setError("Please select a payment method");
            return;
          }

          // Date validation
          if (!data.date) {
            setError("Date is required");
            return;
          }

          const dateObj = toDateObject((data as any).date);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (dateObj > today) {
            setError("Date cannot be in the future");
            return;
          }

          const payload = {
            ...data,
            amount,
            date: dateObj.toISOString(),
            vendor: (data as any).vendor ?? "",
            notes: (data as any).notes ?? "",
          };

          if (mode === "create") {
            const res = await dispatch(createExpense(payload));
            if (createExpense.fulfilled.match(res)) {
              dispatch(fetchExpenses());
              dispatch(fetchExpenseTotals());
              close();
            } else {
              setError("Failed to create expense. Please try again.");
            }
            return;
          }

          const expenseId = normalizedInitialValues?._id;
          if (!expenseId) {
            setError("Missing expense ID for update");
            return;
          }

          const res = await dispatch(updateExpense({ id: expenseId, payload }));
          if (updateExpense.fulfilled.match(res)) {
            dispatch(fetchExpenses());
            dispatch(fetchExpenseTotals());
            close();
          } else {
            setError("Failed to update expense. Please try again.");
          }
        }}
      />
    </>
  );
};

export default AddExpense;