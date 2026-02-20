import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Text, TextField, IconButton } from "@radix-ui/themes";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import DynamicForm from "../../components/dynamicComponents/DynamicForm/DynamicForm";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";

interface AddUserProps {
  mode: "create" | "edit";
  initialValues?: {
    name: string;
    companyId: string;
    email: string;
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
  | "isActive";

const AddUser = ({ mode, initialValues, userId, roles, onSuccess }: AddUserProps) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const isAdmin = (localStorage.getItem("userRole") || "") === "admin";

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ================= FIELDS ================= */
  const fields: FormField<UserField>[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      span: 2,
      placeholder: "Enter full name",
    } as FormField<UserField>,

    // FIX 1: Cast each object individually instead of casting the array
    ...(mode === "create" || (mode === "edit" && isAdmin)
      ? [
          {
            name: "companyId",
            label: "Company ID",
            type: "text",
            required: true,
            span: 2,
            placeholder:
              "Enter Company ID (used for login, e.g. john.karakchaa)",
          } as FormField<UserField>,
        ]
      : []),

    {
      name: "email",
      label: "Email (contact only — not used for login)",
      type: "email",
      span: 2,
      placeholder: "Enter personal email address",
    } as FormField<UserField>,

    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "text",
      span: 2,
      placeholder: "Enter phone number",
    } as FormField<UserField>,

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
    } as FormField<UserField>,

    // FIX 2: Cast each object individually, not the whole array
    ...(mode === "create"
      ? [
          {
           name: "password",
  label: "Password",
  type: "password",   // ✅ always "password", never changes → no remount
  required: true,
  span: 2,
  placeholder: "Enter password (min 6 characters)",
  suffix: (
    <IconButton
      type="button"
      variant="ghost"
      color="gray"
      size="1"
      aria-label="Toggle password visibility"
      onClick={() => {
        // ✅ Toggle directly on DOM — zero state change → zero re-render → form preserved
        const input = document.getElementById("password") as HTMLInputElement | null;
        if (!input) return;
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";

        // Toggle the icon manually via DOM
        const btn = document.activeElement as HTMLElement;
        const eyeOpen = btn.querySelector('[data-eye="open"]');
        const eyeClosed = btn.querySelector('[data-eye="closed"]');
        if (eyeOpen) (eyeOpen as HTMLElement).style.display = isHidden ? "block" : "none";
        if (eyeClosed) (eyeClosed as HTMLElement).style.display = isHidden ? "none" : "block";
      }}
    >
      {/* ✅ Show both icons, toggle display via DOM — no state needed */}
      <span data-eye="open" style={{ display: "none" }}>
        <EyeOpenIcon />
      </span>
      <span data-eye="closed" style={{ display: "block" }}>
        <EyeClosedIcon />
      </span>
    </IconButton>
            ),
          } as FormField<UserField>,
        ]
      : []),

    {
      name: "isActive",
      label: "Active User",
      type: "switch",
      span: 2,
    } as FormField<UserField>,
  ];

  /* ================= SUBMIT ================= */
  // FIX 3: Use Partial<Record<...>> so optional fields (like password) don't cause type errors
  const handleSubmit = async (data: Partial<Record<UserField, any>>) => {
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
        companyId:
          mode === "edit" && !isAdmin
            ? initialValues?.companyId
            : data.companyId,
        email: data.email,
        role: data.role || "staff",
        phoneNumber: data.phoneNumber,
        isActive: data.isActive,
      };

      if (mode === "create") {
        payload.password = data.password;
        await axios.post(
          "http://localhost:5000/api/auth/register",
          payload,
          { headers }
        );
      } else if (mode === "edit" && userId) {
        await axios.put(
          `http://localhost:5000/api/auth/users/${userId}`,
          payload,
          { headers }
        );
      }

      onSuccess();
      navigate("/dashboard/users");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save user");
    }
  };

  return (
    <>
      {error && (
        <div
          style={{
            padding: "12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            fontSize: "14px",
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}

      {mode === "edit" && !isAdmin && (
        <div style={{ marginBottom: "12px" }}>
          <Text size="2" weight="medium" style={{ marginBottom: 4 }}>
            Company ID
          </Text>

          <TextField.Root
            value={initialValues?.companyId || ""}
            readOnly
            disabled
            size="2"
            radius="large"
            variant="surface"
            style={{ height: 35, fontSize: 13, opacity: 0.55 }}
          />

          <Text size="1" style={{ color: "#9ca3af", marginTop: 4 }}>
            Only an admin can change the Company ID
          </Text>
        </div>
      )}

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
          title:
            mode === "edit"
              ? "Are you sure you want to update?"
              : "Are you absolutely sure?",
          description:
            mode === "edit"
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