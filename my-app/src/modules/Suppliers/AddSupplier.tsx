import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

type SupplierField =
  | "companyName"
  | "contactPerson"
  | "phone"
  | "email"
  | "address"
  | "gst"
  | "paymentTerms"
  | "productsSupplied"
  | "active";

const AddSupplier = () => {
  const fields: FormField<SupplierField>[] = [
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      required: true,
      span: 2,
    },

    { name: "contactPerson", label: "Contact Person", type: "text" },
    { name: "phone", label: "Phone", type: "text" },

    { name: "email", label: "Email", type: "email" },

    {
      name: "address",
      label: "Address",
      type: "textarea",
      span: 2,
    },

    { name: "gst", label: "GST Number", type: "text" },
    {
      name: "paymentTerms",
      label: "Payment Terms",
      type: "text",
    },

    {
      name: "productsSupplied",
      label: "Products Supplied",
      type: "textarea",
      span: 2,
    },

    {
      name: "active",
      label: "Active Supplier",
      type: "switch",
      span: 2,
    },
  ];

  return (
    <DynamicForm
      fields={fields}
      onSubmit={(data) => console.log("Supplier:", data)}
    />
  );
};

export default AddSupplier;
