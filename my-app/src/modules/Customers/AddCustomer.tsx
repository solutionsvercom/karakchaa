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
    rows : 2,
    placeholder: "Enter address",
  },

  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    span: 2,
    rows: 2,
    placeholder: "Additional notes...",
  },
];

  return (
    <DynamicForm
      fields={fields}
      onSubmit={(data) => console.log("Customer:", data)}
    />
  );
};

export default AddCustomer;
