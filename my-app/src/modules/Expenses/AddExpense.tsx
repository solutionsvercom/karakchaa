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
      placeholder: "Enter expense title",
      type: "text",
      required: true,
      span: 2,
    },

    {
      name: "category",
      label: "Category",
      type: "select",
      placeholder: "Select category",
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
      required: true,
      placeholder: "Enter amount",
    },

    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      required: true,
      placeholder: "Select payment method",
      options: [
        { label: "Cash", value: "cash" },
        { label: "UPI", value: "upi" },
        { label: "Bank", value: "bank" },
      ],
    },

    {
      name: "date",
      label: "Date",
      required: true,
      placeholder: "Select date",
      type: "date", // can be date picker later
    },

    {
      name: "vendor",
      label: "Vendor / Payee",
      required: true,
      placeholder: "Enter vendor or payee",
      type: "text",
      span: 2,
    },

    {
      name: "notes",
      label: "Notes",
      placeholder: "Enter notes",
      type: "textarea",
      span: 2,
    },
  ];

  return (
    <DynamicForm
    title="Add Expense"
    fields={fields}
    submitText="Create"
    cancelText="Cancel"
    onCancel={() => {
      // close dialog if this form is inside Dialog
      // or just console.log for now
      console.log("Cancel clicked");
    }}
    confirm={{
      title: "Are you absolutely sure?",
      description: "This action cannot be undone.",
      confirmText: "Yes, Create",
      cancelText: "No, go back",
    }}
    onSubmit={(data) => {
      console.log("Expense:", data);
    }}
  />
  );
};

export default AddExpense;
