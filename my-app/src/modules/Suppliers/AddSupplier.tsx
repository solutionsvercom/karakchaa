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
      placeholder: "Enter company name",
    },

    { name: "contactPerson",
       label: "Contact Person", 
       type: "text",
       required: true,
       placeholder: "contact person name"
      },

    { name: "phone", 
      label: "Phone", 
      type: "text",
      required: true,
      placeholder: "Enter phone number"
     },

    { name: "email", 
      label: "Email", 
      type: "email",
      span: 2,
       placeholder: "Enter email address"
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

    { name: "gst", 
      label: "GST Number",
      required: true,
       type: "text",
        placeholder: "Enter GST number" },
    {
      name: "paymentTerms",
      label: "Payment Terms",
      required: true,
      type: "text",
      placeholder: "e.g. Net 30 days"
    },

    {
      name: "productsSupplied",
      label: "Products Supplied",
      required: true,
      type: "textarea",
      span: 2,
      placeholder: "Enter products supplied"
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
      console.log("Product:", data);
    }}
  />
  );
};

export default AddSupplier;
