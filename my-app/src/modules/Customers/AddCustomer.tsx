import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

/* ---------- PROPS (ADDED) ---------- */
interface AddCustomerProps {
  mode: "create" | "edit";
  initialValues?: any;
}

/* ---------- FIELD TYPE ---------- */
type CustomerField =
  | "name"
  | "phone"
  | "email"
  | "address"
  | "notes";

/* ---------- COMPONENT ---------- */
const AddCustomer = ({ mode, initialValues }: AddCustomerProps) => {
  const fields: FormField<CustomerField>[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      span: 2,
      placeholder: "Enter full name",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "text",
      required: true,
      span: 2,
      placeholder: "Enter phone number",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      span: 2,
      placeholder: "Enter email address",
    },
    {
      name: "address",
      label: "Address",
      type: "textarea",
      span: 2,
      placeholder: "Enter address",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      span: 2,
      placeholder: "Additional notes...",
    },
  ];

  return (
    <DynamicForm
      title={mode === "edit" ? "Edit Customer" : "Add New Customer"}
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
            ? "This will update the customer details."
            : "This action cannot be undone.",
        confirmText: mode === "edit" ? "Yes, Update" : "Yes, Create",
        cancelText: "No, go back",
      }}
      onSubmit={(data) => {
        if (mode === "create") {
          console.log("POST /customers", data);
        } else {
          console.log("PUT /customers/:id", data);
        }
      }}
    />
  );
};

export default AddCustomer;