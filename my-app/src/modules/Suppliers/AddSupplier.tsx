import { useState } from "react";
import { Callout } from "@radix-ui/themes";
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

export type SupplierFormValues = Partial<Record<SupplierField, any>>;

type AddSupplierProps = {
  onClose: () => void;
  initialValues?: SupplierFormValues;
  mode?: "add" | "edit";
  onSave: (data: SupplierFormValues) => void;
};

const AddSupplier = ({ onClose, initialValues, mode = "add", onSave }: AddSupplierProps) => {
  const [error, setError] = useState<string | null>(null);

  const fields: FormField<SupplierField>[] = [
    { name: "companyName", label: "Company Name", type: "text", placeholder: "Company Name", required: true, span: 2 },
    { name: "contactPerson", label: "Contact Person", placeholder: "Enter Contact Person", type: "text", required: true },
    { name: "phone", label: "Phone", placeholder: "Enter 10 digit phone number", type: "text", required: true },
    { name: "email", label: "Email", placeholder: "Enter Email", type: "email", span: 2 },
    { name: "address", label: "Address", placeholder: "Enter Address", type: "textarea", span: 2, rows: 2 },
    { name: "gst", label: "GST Number", placeholder: "Enter GST Number", type: "text" },
    { name: "paymentTerms", label: "Payment Terms", placeholder: "Enter Payment Terms", type: "text" },
    { name: "productsSupplied", label: "Products Supplied", type: "textarea", placeholder: "Enter Products Supplied", span: 2 },
    { name: "active", label: "Active Supplier", type: "switch", span: 2 },
  ];

  return (
    <>
      {error && (
        <Callout.Root color="red" style={{ marginBottom: "16px" }}>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <DynamicForm
        title={mode === "edit" ? "Edit Supplier" : "Add Supplier"}
        fields={fields}
        initialValues={initialValues}
        submitText={mode === "edit" ? "Update" : "Create"}
        cancelText="Cancel"
        onCancel={() => {
          setError(null);
          onClose();
        }}
        confirm={{
          title: mode === "edit" ? "Are you sure you want to update?" : "Are you absolutely sure?",
          description: mode === "edit" ? "This will update the supplier details." : "This action cannot be undone.",
          confirmText: mode === "edit" ? "Yes, Update" : "Yes, Create",
          cancelText: "No, go back",
        }}
        onSubmit={(data) => {
          setError(null);

          if (!data.companyName?.trim()) {
            setError("Company name is required");
            return;
          }

          if (!data.contactPerson?.trim()) {
            setError("Contact person is required");
            return;
          }

          const digits = String(data.phone ?? "").replace(/\D/g, "");
          if (!digits) {
            setError("Phone number is required");
            return;
          }
          if (digits.length < 10) {
            setError(`Phone number is too short (${digits.length}/10 digits)`);
            return;
          }
          if (digits.length > 10) {
            setError(`Phone number is too long (${digits.length}/10 digits)`);
            return;
          }

          const email = data.email?.trim();
          if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            setError("Please enter a valid email address");
            return;
          }

          const gst = data.gst?.trim().toUpperCase();
          if (gst && !/^[A-Z0-9]+$/.test(gst)) {
            setError("Please enter a valid GST number");
            return;
          }

          onSave({ ...data, phone: digits, gst });
          onClose();
        }}
      />
    </>
  );
};

export default AddSupplier;