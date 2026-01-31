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
    },

    {
      name: "category",
      label: "Category",
      type: "select",
      options: [
        { label: "Miscellaneous", value: "misc" },
        { label: "Rent", value: "rent" },
        { label: "Salary", value: "salary" },
      ],
    },

    {
      name: "amount",
      label: "Amount (₹)",
      type: "number",
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
      type: "text", // can be date picker later
    },

    {
      name: "vendor",
      label: "Vendor / Payee",
      type: "text",
      span: 2,
    },

    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      span: 2,
    },
  ];

  return (
    <DynamicForm
      fields={fields}
      onSubmit={(data) => console.log("Expense:", data)}
    />
  );
};

export default AddExpense;
