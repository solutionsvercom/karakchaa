import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/Store";
import {
  createEmployee,
  updateEmployee,
} from "../../features/EmployeesSlice";
import { useNavigate } from "react-router-dom";

import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

interface AddEmployeeProps {
  mode: "create" | "edit";
  initialValues?: any;
}

type EmployeeField =
  | "name"
  | "phone"
  | "email"
  | "role"
  | "salary"
  | "joinDate"
  | "address"
  | "emergencyContact"
  | "active";

const AddEmployee = ({ mode, initialValues }: AddEmployeeProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const fields: FormField<EmployeeField>[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter full name",
      span: 2,
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
      placeholder: "Enter email address",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      placeholder: "Select role",
      options: [
        { label: "Staff", value: "staff" },
        { label: "Manager", value: "manager" },
        { label: "Owner", value: "owner" },
        { label: "Cashier", value: "cashier" },
        { label: "Chef", value: "chef" },
        { label: "Delivery", value: "delivery" },
      ],
    },
    {
      name: "salary",
      label: "Monthly Salary (₹)",
      type: "number",
      required: true,
      placeholder: "Enter salary amount",
    },
    {
      name: "joinDate",
      label: "Join Date",
      type: "date",
      placeholder: "dd/mm/yyyy",
      span: 2,
    },
    {
      name: "address",
      label: "Address",
      type: "textarea",
      placeholder: "Enter address",
      span: 2,
    },
    {
      name: "emergencyContact",
      label: "Emergency Contact",
      type: "text",
      placeholder: "Enter emergency contact details",
      span: 2,
    },
    {
      name: "active",
      label: "Active Employee",
      type: "switch",
      span: 2,
    },
  ];

  return (
    <DynamicForm
      // ❌ Removed title to avoid duplicate heading
      fields={fields}
      initialValues={initialValues || {}}
      submitText={mode === "edit" ? "Update" : "Create"}
      cancelText="Cancel"
      onCancel={() => navigate("/dashboard/employees")}
      confirm={{
        title:
          mode === "edit"
            ? "Are you sure you want to update?"
            : "Are you absolutely sure?",
        description:
          mode === "edit"
            ? "This will update the employee details."
            : "This action cannot be undone.",
        confirmText: mode === "edit" ? "Yes, Update" : "Yes, Create",
        cancelText: "No, go back",
      }}
      onSubmit={async (data) => {
        const formattedData = {
          ...data,
          salary: Number(data.salary),
        };

        try {
          if (mode === "create") {
            await dispatch(createEmployee(formattedData)).unwrap();
          } else if (initialValues?._id) {
            await dispatch(
              updateEmployee({
                id: initialValues._id,
                data: formattedData,
              })
            ).unwrap();
          }

          navigate("/dashboard/employees"); // ✅ Auto close dialog
        } catch (error: any) {
          alert(error);
        }
      }}
    />
  );
};

export default AddEmployee;
