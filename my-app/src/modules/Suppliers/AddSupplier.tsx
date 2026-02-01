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

const AddSupplier = ({ onClose }: { onClose: () => void }) => {
  const fields: FormField<SupplierField>[] = [
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      required: true,
      span: 2,
      placeholder: "Enter company name",
    },
    {
      name: "contactPerson",
      label: "Contact Person",
      type: "text",
      required: true,
      placeholder: "Contact person name",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      required: true,
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
      required: true,
      span: 2,
      rows: 2,
      placeholder: "Enter supplier address",
    },
    {
      name: "gst",
      label: "GST Number",
      type: "text",
      required: true,
      placeholder: "Enter GST number",
    },
    {
      name: "paymentTerms",
      label: "Payment Terms",
      type: "text",
      required: true,
      placeholder: "e.g. Net 30 days",
    },
    {
      name: "productsSupplied",
      label: "Products Supplied",
      type: "textarea",
      required: true,
      span: 2,
      placeholder: "Enter products supplied",
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
      title="Add Supplier"
      fields={fields}
      submitText="Create"
      cancelText="Cancel"
      onCancel={onClose}
      confirm={{
        title: "Are you absolutely sure?",
        description: "This action cannot be undone.",
        confirmText: "Yes, Create",
        cancelText: "No, go back",
      }}
      onSubmit={(data) => {
        console.log("Supplier:", data);
        onClose();
      }}
    />
  );
};

export default AddSupplier;