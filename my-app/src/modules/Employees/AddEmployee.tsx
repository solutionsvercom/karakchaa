import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

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

const AddEmployee = () => {
  const fields: FormField<EmployeeField>[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      span: 2,
    },

    { name: "phone", label: "Phone", type: "text" },
    { name: "email", label: "Email", type: "email" },

    {
      name: "role",
      label: "Role",
      type: "select",
      options: [
        { label: "Staff", value: "staff" },
        { label: "Manager", value: "manager" },
      ],
    },

    {
      name: "salary",
      label: "Monthly Salary (₹)",
      type: "number",
    },

    {
      name: "joinDate",
      label: "Join Date",
      type: "text", // can be date later
      span: 2,
    },

    {
      name: "address",
      label: "Address",
      type: "textarea",
      span: 2,
    },

    {
      name: "emergencyContact",
      label: "Emergency Contact",
      type: "text",
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
      fields={fields}
      onSubmit={(data) => console.log("Employee:", data)}
    />
  );
};

export default AddEmployee;
