import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

interface AddSaleProps {
  mode: "create" | "edit";
  initialValues?: any;
  onSubmit: (values: any) => void;
}

type SaleField =
  | "invoice"
  | "customer"
  | "items"
  | "type"
  | "amount"
  | "date";


const AddSale = ({ mode, initialValues, onSubmit }: AddSaleProps) => {
  const fields: FormField<SaleField>[] = [
  {
    name: "invoice",
    label: "Invoice No",
    type: "text",
    required: true,
  },
  {
    name: "customer",
    label: "Customer",
    type: "text",
    required: true,
  },
  {
    name: "items",
    label: "Items",
    type: "text",
  },
  {
    name: "type",
    label: "Payment Type",
    type: "select",
    options: [{ label: "Cash", value: "Cash" },
        { label: "Card", value: "Card" },
        { label: "Upi", value: "Upi" },],
  },
  {
    name: "amount",
    label: "Amount",
    type: "number",
    required: true,
  },
  {
    name: "date",
    label: "Date",
    type: "date",
  },
];
  return (
    <DynamicForm
    title={mode === "edit" ? "Edit Sale" : "Add New Sale"}
      fields={fields}
      initialValues={initialValues}
      submitText={mode === "edit" ? "Update" : "Create"}
      cancelText="Cancel"
      onCancel={() => {
        console.log("Cancel clicked");
      }}
      confirm={{
        title:
          mode === "edit"
            ? "Are you sure you want to update?"
            : "Are you absolutely sure?",
        description:
          mode === "edit"
            ? "This will update the sales details."
            : "This action cannot be undone.",
        confirmText: mode === "edit" ? "Yes, Update" : "Yes, Create",
        cancelText: "No, go back",
      }}
      onSubmit={(data) => {
        if (mode === "create") {
          console.log("POST /sales", data);
        } else {
          console.log("PUT /sales/:id", data);
        }
      }}
    />
  );
};
  
export default AddSale;