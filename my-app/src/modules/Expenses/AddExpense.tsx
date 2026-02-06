import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { useNavigate } from "react-router-dom";

interface AddExpensesProps {
  mode: "create" | "edit";
  initialValues?: any;
}

type ExpenseField =
  | "title"
  | "category"
  | "amount"
  | "paymentMethod"
  | "date"
  | "vendor"
  | "notes";

const AddExpense = ({ mode, initialValues }: AddExpensesProps) => {
  const navigate = useNavigate();

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
    {
      name: "amount",
      label: "Amount (₹)",
      type: "number",
      required: true,
      span: 1,
      placeholder: "0.00",
    },
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
    {
      name: "date",
      label: "Date",
      type: "date",
      required: true,
      span: 1,
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
      title={mode === "edit" ? "Edit Expense" : "Add Expense"}
      fields={fields}
      initialValues={initialValues}
      submitText={mode === "edit" ? "Update" : "Create"}
      cancelText="Cancel"
      onCancel={() => {
        navigate("/dashboard/expenses");
      }}
      confirm={{
        title:
          mode === "edit"
            ? "Are you sure you want to update?"
            : "Are you absolutely sure?",
        description:
          mode === "edit"
            ? "This will update the expense details."
            : "This action cannot be undone.",
        confirmText: mode === "edit" ? "Yes, Update" : "Yes, Create",
        cancelText: "No, go back",
      }}
      onSubmit={(data) => {
        if (mode === "create") {
          console.log("POST /expenses", data);
          navigate("/dashboard/expenses");
        } else {
          console.log("PUT /expenses/:id", data);
          navigate("/dashboard/expenses");
        }
      }}
    />
  );
};

export default AddExpense;