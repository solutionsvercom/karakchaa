import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

/* ---------- FIELD TYPES ---------- */
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

/* ---------- FORM VALUE TYPE ---------- */
export type SupplierFormValues = Partial<Record<SupplierField, any>>;

/* ---------- PROPS ---------- */
type AddSupplierProps = {
  onClose: () => void;
  initialValues?: SupplierFormValues;
  mode?: "add" | "edit";
  onSave: (data: SupplierFormValues) => void; // ✅ added
};

/* ---------- COMPONENT ---------- */
const AddSupplier = ({
  onClose,
  initialValues,
  mode = "add",
  onSave,
}: AddSupplierProps) => {
  const fields: FormField<SupplierField>[] = [
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      placeholder: "Company Name",
      required: true,
      span: 2,
    },
    {
      name: "contactPerson",
      label: "Contact Person",
      placeholder: "Enter Contact Person",
      type: "text",
      required: true,
    },
    {
      name: "phone",
      label: "Phone",
      placeholder: "Enter Phone No",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      placeholder: "Enter Email",
      type: "email",
      span: 2,
    },
    {
      name: "address",
      label: "Address",
      placeholder: "Enter Address",
      type: "textarea",
      span: 2,
      rows: 2,
    },
    {
      name: "gst",
      label: "GST Number",
      placeholder: "Enter GST Number",
      type: "text",
    },
    {
      name: "paymentTerms",
      label: "Payment Terms",
      placeholder: "Enter Payment Terms",
      type: "text",
    },
    {
      name: "productsSupplied",
      label: "Products Supplied",
      type: "textarea",
      placeholder: "Enter Products Supplied",
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
      title={mode === "edit" ? "Edit Supplier" : "Add Supplier"}
      fields={fields}
      initialValues={initialValues}
      submitText={mode === "edit" ? "Update" : "Create"}
      cancelText="Cancel"
      onCancel={onClose}
      onSubmit={(data) => {
        onSave(data);   // ✅ actually save
        onClose();      // ✅ close dialog
      }}
    />
  );
};

export default AddSupplier;
