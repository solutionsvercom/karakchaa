import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { useDispatch } from "react-redux";
import { createCustomer, updateCustomer,fetchCustomers, 
  fetchCustomerStats  } from "../../features/CustomersSlice";
import { AppDispatch } from "../../store/Store";
import { useNavigate } from "react-router-dom";


/* ---------- PROPS (ADDED) ---------- */
interface AddCustomerProps {
  mode: "create" | "edit";
  initialValues?: any;
  customerId?: string;
}

/* ---------- FIELD TYPE ---------- */
type CustomerField =
  | "name"
  | "phone"
  | "email"
  | "address"
  | "notes";

/* ---------- COMPONENT ---------- */
const AddCustomer = ({ mode, initialValues, customerId }: AddCustomerProps) => {

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
const dispatch = useDispatch<AppDispatch>();
const navigate = useNavigate();

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
      onSubmit={async (data) => {
  try {
    // 🔥 TRANSFORM FRONTEND → BACKEND FORMAT
    const payload = {
      fullName: data.name,
      phoneNumber: data.phone,
      email: data.email,
      address: data.address,
      notes: data.notes,
    };

    if (mode === "create") {
      await dispatch(createCustomer(payload)).unwrap();
    } else if (mode === "edit" && customerId) {
      await dispatch(
        updateCustomer({
          id: customerId,
          data: payload,
        })
      ).unwrap();
    }

    await dispatch(fetchCustomers());
    await dispatch(fetchCustomerStats());

    navigate("/dashboard/customer");

  } catch (error) {
    console.error("Failed:", error);
  }
}}



    />
  );
};

export default AddCustomer;