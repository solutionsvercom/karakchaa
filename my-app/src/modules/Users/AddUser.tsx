import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Text, TextField } from "@radix-ui/themes";
import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

interface AddUserProps {
  mode: "create" | "edit";
  initialValues?: {
    name: string;
    companyId: string;  // used for login
    email: string;      // contact only
    role: string;
    phoneNumber?: string;
    isActive?: boolean;
  };
  userId?: string;
  roles: any[];
  onSuccess: () => void;
}

type UserField =
  | "name"
  | "companyId"
  | "email"
  | "phoneNumber"
  | "role"
  | "password"
  |  "isActive";

const AddUser = ({ mode, initialValues, userId, roles, onSuccess }: AddUserProps) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Check if the currently logged-in user is admin
  const isAdmin = (localStorage.getItem("userRole") || "") === "admin";

  const [error, setError] = useState("");

  /* ================= FIELDS ================= */
  const fields: FormField<UserField>[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      span: 2,
      placeholder: "Enter full name",
    },

    // Company ID:
    //   - create mode → always editable
    //   - edit + admin → editable
    //   - edit + non-admin → shown as locked TextField below (not in DynamicForm)
    ...(mode === "create" || (mode === "edit" && isAdmin)
      ? ([
          {
            name: "companyId",
            label: "Company ID",
            type: "text",
            required: true,
            span: 2,
            placeholder: "Enter Company ID (used for login, e.g. john.karakchaa)",
          },
        ] as FormField<UserField>[])
      : []),

    {
      name: "email",
      label: "Email (contact only — not used for login)",
      type: "email",
      span: 2,
      placeholder: "Enter personal email address",
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "text",
      span: 2,
      placeholder: "Enter phone number",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      span: 2,
      placeholder: "Select role",
      options: roles.map((r) => ({
        value: r._id,
        label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
      })),
    },

    // Password only on create
    ...(mode === "create"
      ? ([
          {
            name: "password",
            label: "Password",
            type: "password",
            required: true,
            span: 2,
            placeholder: "Enter password (min 6 characters)",
          },
        ] as FormField<UserField>[])
      : []),
      
       {
      name: "isActive",
      label: "Active User",
      type: "switch",
      span: 2,
    },
  ];

  /* ================= SUBMIT ================= */
  const handleSubmit = async (data: Record<UserField, any>) => {
    setError("");

    if (!data.name?.trim()) {
      setError("Please enter a name");
      return;
    }
    if ((mode === "create" || isAdmin) && !data.companyId?.trim()) {
      setError("Please enter a Company ID");
      return;
    }
    if (mode === "create" && !data.password) {
      setError("Password is required");
      return;
    }
    if (mode === "create" && data.password?.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const payload: any = {
        name: data.name,
        // Non-admin in edit mode: keep original companyId
        companyId: mode === "edit" && !isAdmin
          ? initialValues?.companyId
          : data.companyId,
        email: data.email,
        role: data.role || "staff",
        phoneNumber: data.phoneNumber,
        isActive: data.isActive,
      };

      if (mode === "create") {
        payload.password = data.password;
        await axios.post("http://localhost:5000/api/auth/register", payload, { headers });
      } else if (mode === "edit" && userId) {
        await axios.put(`http://localhost:5000/api/auth/users/${userId}`, payload, { headers });
      }

      onSuccess();
      navigate("/dashboard/users");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save user");
    }
  };

  return (
    <>
      {/* ERROR */}
      {error && (
        <div style={{
          padding: "12px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#dc2626",
          fontSize: "14px",
          marginBottom: "12px",
        }}>
          {error}
        </div>
      )}

      {/* LOCKED COMPANY ID — edit mode, non-admin only
          Using TextField.Root (Radix component) avoids raw <input> lint warnings:
          - no missing label/title/placeholder axe warning
          - no "move inline styles to CSS" Edge Tools warning           */}
      {mode === "edit" && !isAdmin && (
        <div style={{ marginBottom: "12px" }}>
          <Text
            size="2"
            weight="medium"
            style={{ display: "block", marginBottom: 4, color: "#374151" }}
          >
            Company ID
          </Text>
          <TextField.Root
            aria-label="Company ID (read-only, contact admin to change)"
            placeholder="Company ID"
            value={initialValues?.companyId || ""}
            readOnly
            disabled
            size="2"
            radius="large"
            variant="surface"
            style={{ height: 35, fontSize: 13, opacity: 0.55, cursor: "not-allowed" }}
          />
          <Text size="1" style={{ color: "#9ca3af", marginTop: "4px", display: "block" }}>
            Only an admin can change the Company ID
          </Text>
        </div>
      )}

      {/* DYNAMIC FORM */}
      <DynamicForm
        title={mode === "edit" ? "Edit User" : "Add New User"}
        fields={fields}
        initialValues={{
          name: initialValues?.name || "",
          companyId: initialValues?.companyId || "",
          email: initialValues?.email || "",
          phoneNumber: initialValues?.phoneNumber || "",
          role: initialValues?.role || "",
          password: "",
          isActive: initialValues?.isActive ?? true,
        }}
        submitText={mode === "edit" ? "Update User" : "Create User"}
        cancelText="Cancel"
        onCancel={() => navigate("/dashboard/users")}
        confirm={{
          title: mode === "edit"
            ? "Are you sure you want to update?"
            : "Are you absolutely sure?",
          description: mode === "edit"
            ? "This will update the user details."
            : "This action cannot be undone.",
          confirmText: mode === "edit" ? "Yes, Update" : "Yes, Create",
          cancelText: "No, go back",
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default AddUser;