import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";


type CustomerField =
  | "name"
  | "phone"
  | "email"
  | "address"
  | "notes";

const AddCustomer = () => {
  const fields: FormField<CustomerField>[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    required: true,
    span: 2, // full width
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
    title="Add New Customer"
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
      console.log("Customer:", data);
    }}
  />
  );
};

export default AddCustomer;
