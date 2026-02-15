import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { useDispatch, useSelector } from "react-redux"; // ✅ Add useSelector
import { 
  createCustomer, 
  updateCustomer,
  fetchCustomers, 
  fetchCustomerStats,
  clearError // ✅ Import clearError
} from "../../features/CustomersSlice";
import { AppDispatch, RootState } from "../../store/Store"; // ✅ Add RootState
import { useNavigate } from "react-router-dom";
import { useEffect } from "react"; // ✅ Add useEffect
import { Callout } from "@radix-ui/themes"; // ✅ Import Callout for error display

interface AddCustomerProps {
  mode: "create" | "edit";
  initialValues?: any;
  customerId?: string;
}

type CustomerField =
  | "name"
  | "phone"
  | "email"
  | "address"
  | "notes";

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
  
  // ✅ Get error from Redux state
  const error = useSelector((state: RootState) => state.customer.error);

  // ✅ Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <>
      {/* ✅ Show error alert if exists */}
      {error && (
        <Callout.Root color="red" style={{ marginBottom: "16px" }}>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <DynamicForm
        title={mode === "edit" ? "Edit Customer" : "Add New Customer"}
        fields={fields}
        initialValues={initialValues}
        submitText={mode === "edit" ? "Update" : "Create"}
        cancelText="Cancel"
        onCancel={() => {
          dispatch(clearError());
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
            dispatch(clearError()); // Clear previous errors

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
            // Error is already in Redux state, just log it
            console.error("Failed:", error);
          }
        }}
      />
    </>
  );
};

export default AddCustomer;