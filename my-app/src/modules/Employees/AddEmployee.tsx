import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/Store";
import {
  createEmployee,
  updateEmployee,
} from "../../features/EmployeesSlice";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { Callout } from "@radix-ui/themes";

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

  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);

  /* ================= FETCH ROLES ================= */

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(res.data.roles || []);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    };

    fetchRoles();
  }, []);

  /* ================= VALIDATION (UPDATED) ================= */
          const validate = (data: any) => {
  const name = data.name?.trim();
  const phone = data.phone?.trim();
  const email = data.email?.trim();
  const role = data.role;
  const salary = Number(data.salary);

  // 1️⃣ Name
  if (!name) {
    return "Full name is required";
  }

  if (name.length < 3) {
    return "Full name must be at least 3 characters";
  }

  if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    return "Full name contains invalid characters";
  }

  // 2️⃣ Phone
  if (!phone) {
    return "Phone number is required";
  }

  if (!/^\d{10}$/.test(phone)) {
    return "Phone number must be exactly 10 digits";
  }

  // 3️⃣ Email (optional but validated if provided)
  if (email) {
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
  }

  // 4️⃣ Role
  if (!role) {
    return "Please select a role";
  }

  // 5️⃣ Salary
  if (!data.salary || isNaN(salary)) {
    return "Salary is required";
  }

  if (salary <= 0) {
    return "Salary must be greater than 0";
  }

  if (salary > 10000000) {
    return "Salary amount seems unrealistic";
  }

  return null;
};

  
  /* ================= FIELDS ================= */

  const fields: FormField<EmployeeField>[] = [
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
      label: "Phone",
      type: "text",
      required: true,
      placeholder: "Enter 10 digit phone number",
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
      options: roles.map((r) => ({
        label: r.name,
        value: r.name,
      })),
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

  /* ================= UI ================= */

  return (
    <>
      {error && (
        <Callout.Root color="red" style={{ marginBottom: 16 }}>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <DynamicForm
        fields={fields}
        initialValues={{
          name: "",
          phone: "",
          email: "",
          role: "",
          salary: "",
          joinDate: undefined,
          address: "",
          emergencyContact: "",
          active: true,
          ...initialValues,
        }}
        submitText={mode === "edit" ? "Update" : "Create"}
        cancelText="Cancel"
        onCancel={() => navigate("/dashboard/employees")}
        onFieldChange={(field, value) => {
          if (field === "phone") {
            return value.replace(/\D/g, "").slice(0, 10);
          }
          return value;
        }}
        onSubmit={async (data) => {
          setError(null);

          const validationError = validate(data);
          if (validationError) {
            setError(validationError);
            return;
          }

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

            navigate("/dashboard/employees");
          } catch (err: any) {
            setError(err || "Something went wrong");
          }
        }}
      />
    </>
  );
};

export default AddEmployee;
