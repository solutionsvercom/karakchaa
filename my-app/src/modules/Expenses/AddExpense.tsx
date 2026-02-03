// import { Dialog } from "@radix-ui/themes";
import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

type ExpenseField =
  | "title"
  | "category"
  | "amount"
  | "paymentMethod"
  | "date"
  | "vendor"
  | "notes";

const AddExpense = () => {
  const fields: FormField<ExpenseField>[] = [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      span: 2,
      placeholder: "e.g., Monthly Rent",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
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
    {
      name: "amount",
      label: "Amount (₹)",
      type: "number",
      placeholder: "0.00",
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      options: [
        { label: "Cash", value: "cash" },
        { label: "UPI", value: "upi" },
        { label: "Bank", value: "bank" },
      ],
    },
    {
      name: "date",
      label: "Date",
      type: "date",
    },
    {
      name: "vendor",
      label: "Vendor / Payee",
      type: "text",
      span: 2,
      placeholder: "Enter vendor name",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      span: 2,
      placeholder: "Additional notes",
    },
  ];

  return (
  <DynamicForm
    fields={fields}
    submitText="Record Expense"
    cancelText="Cancel"
    onSubmit={(data) => {
      console.log("Expense:", data);
    }}
  />
);
}

export default AddExpense;
