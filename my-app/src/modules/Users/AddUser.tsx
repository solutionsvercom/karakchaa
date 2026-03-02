import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_AUTH } from "../../config/Api";
import { Text, TextField, IconButton, Switch } from "@radix-ui/themes";
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

type UserField = "name" | "companyId" | "email" | "phoneNumber" | "role";

// Password input 
function PasswordInput({
  id,
  label,
  required,
  placeholder,
  value,
  onChange,
  error,
  disabled,
}: {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <Text
          size="2"
          weight="medium"
          style={{
            display: "block",
            marginBottom: 4,
            color: disabled ? "#9ca3af" : undefined,
          }}
        >
          {label}
          {required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
        </Text>
      )}
      <div style={{ position: "relative" }}>
        <TextField.Root
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          size="2"
          radius="large"
          variant="surface"
          style={{
            height: 35,
            fontSize: 13,
            paddingRight: 36,
            borderColor: error ? "#fca5a5" : undefined,
            opacity: disabled ? 0.45 : 1,
            cursor: disabled ? "not-allowed" : undefined,
          }}
        />
        {!disabled && (
          <IconButton
            type="button"
            variant="ghost"
            color="gray"
            size="1"
            aria-label="Toggle password visibility"
            onClick={() => setShow((s) => !s)}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
          >
            {show ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </IconButton>
        )}
      </div>
      {error && (
        <Text size="1" style={{ color: "#dc2626", marginTop: 3, display: "block" }}>
          {error}
        </Text>
      )}
    </div>
  );
}

// Main 
const AddUser = ({ mode, initialValues, userId, roles, onSuccess }: AddUserProps) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const isAdmin = (localStorage.getItem("userRole") || "") === "admin";

  const [formError, setFormError] = useState("");
  const [isActive, setIsActive] = useState<boolean>(initialValues?.isActive ?? true);

  //  CREATE
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  //  EDIT
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  // Tracks whether current password has been successfully verified
  const [currentPasswordOk, setCurrentPasswordOk] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");

  /* Verify current password on blur  */
  const verifyCurrentPassword = async () => {
    if (!currentPassword) {
      setCurrentPasswordOk(false);
      return;
    }
    setVerifying(true);
    setCurrentPasswordError("");
    try {
      await axios.post(`${API_AUTH}/login`, {
        companyId: initialValues?.companyId,
        password: currentPassword,
      });
      setCurrentPasswordOk(true);   // unlocks new password fields
      setCurrentPasswordError("");
    } catch (err: any) {
      const status = err.response?.status;
      setCurrentPasswordError(
        status === 401 || status === 400
          ? "Current password is incorrect"
          : "Could not verify — try again"
      );
      setCurrentPasswordOk(false);  // keeps new password fields locked
      // Clear new/confirm so locked fields don't retain stale values
      setNewPassword("");
      setConfirmNewPassword("");
      setNewPasswordError("");
      setConfirmNewPasswordError("");
    } finally {
      setVerifying(false);
    }
  };

  /*  onBeforeSubmit */
  const handleBeforeSubmit = async (_values: Record<UserField, any>): Promise<boolean> => {
    let valid = true;

    // CREATE validation
    if (mode === "create") {
      if (!password) { setPasswordError("Password is required"); valid = false; }
      else if (password.length < 6) { setPasswordError("Password must be at least 6 characters"); valid = false; }
      else setPasswordError("");

      if (!confirmPassword) { setConfirmPasswordError("Please confirm your password"); valid = false; }
      else if (password !== confirmPassword) { setConfirmPasswordError("Passwords do not match"); valid = false; }
      else setConfirmPasswordError("");
    }

    // EDIT validation — only if user started filling in password change
    if (mode === "edit" && currentPassword) {
      // If current password isn't verified yet, verify now
      if (!currentPasswordOk) {
        setVerifying(true);
        try {
          await axios.post(`${API_AUTH}/login`, {
            companyId: initialValues?.companyId,
            password: currentPassword,
          });
          setCurrentPasswordOk(true);
          setCurrentPasswordError("");
        } catch (err: any) {
          const status = err.response?.status;
          setCurrentPasswordError(
            status === 401 || status === 400
              ? "Current password is incorrect"
              : "Could not verify — try again"
          );
          setCurrentPasswordOk(false);
          setVerifying(false);
          return false; // block immediately
        }
        setVerifying(false);
      }

      // Validate new password
      if (!newPassword) { setNewPasswordError("New password is required"); valid = false; }
      else if (newPassword.length < 6) { setNewPasswordError("New password must be at least 6 characters"); valid = false; }
      else if (newPassword === currentPassword) { setNewPasswordError("Must be different from current password"); valid = false; }
      else setNewPasswordError("");

      // Validate confirm
      if (!confirmNewPassword) { setConfirmNewPasswordError("Please confirm your new password"); valid = false; }
      else if (confirmNewPassword !== newPassword) { setConfirmNewPasswordError("Passwords do not match"); valid = false; }
      else setConfirmNewPasswordError("");
    }

    return valid;
  };

  /* Final submit  */
  const handleSubmit = async (data: Record<UserField, any>) => {
    setFormError("");
    try {
      const payload: any = {
        name: data.name,
        companyId: mode === "edit" && !isAdmin ? initialValues?.companyId : data.companyId,
        email: data.email,
        role: data.role || "staff",
        phoneNumber: data.phoneNumber,
        isActive,
      };

      if (mode === "create") {
        payload.password = password;
        await axios.post(`${API_AUTH}/register`, payload, { headers });
      } else if (mode === "edit" && userId) {
        if (currentPasswordOk && newPassword) payload.password = newPassword;
        await axios.put(`${API_AUTH}/users/${userId}`, payload, { headers });
      }

      onSuccess();
      navigate("/dashboard/users");
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save user");
    }
  };

  /*  Fields  */
  const fields: FormField<UserField>[] = [
    { name: "name", label: "Full Name", type: "text", required: true, span: 2, placeholder: "Enter full name" } as FormField<UserField>,

    ...(mode === "create" || (mode === "edit" && isAdmin)
      ? [{ name: "companyId", label: "Company ID", type: "text", required: true, span: 2, placeholder: "Enter Company ID" } as FormField<UserField>]
      : []),

    { name: "email", label: "Email (contact only — not used for login)", type: "email", span: 2, placeholder: "Enter personal email address" } as FormField<UserField>,
    { name: "phoneNumber", label: "Phone Number", type: "text", span: 2, placeholder: "Enter phone number" } as FormField<UserField>,
    {
      name: "role", label: "Role", type: "select", span: 2, placeholder: "Select role",
      options: roles.map((r) => ({ value: r._id, label: r.name.charAt(0).toUpperCase() + r.name.slice(1) })),
    } as FormField<UserField>,
  ];

  /* Extra content  */
  const extraContent = (
    <>
      {mode === "create" ? (
        <>
          <PasswordInput
            id="password" label="Create Password" required
            placeholder="Enter password (min 6 characters)"
            value={password}
            onChange={(v) => { setPassword(v); if (passwordError) setPasswordError(""); }}
            error={passwordError}
          />
          <PasswordInput
            id="confirmPassword"
            label={password && confirmPassword && password !== confirmPassword ? "Create Password" : "Confirm Password"}
            required placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); if (confirmPasswordError) setConfirmPasswordError(""); }}
            error={confirmPasswordError}
          />
        </>
      ) : (
        <>
          <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: 14, marginTop: 2 }} />
          <Text size="2" weight="bold" style={{ display: "block", marginBottom: 10, color: "#374151" }}>
            Change Password{" "}
            <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 12 }}>(optional — leave blank to keep current)</span>
          </Text>

          {/* Current password — verified onBlur */}
          <div style={{ position: "relative" }}>
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(v) => {
                setCurrentPassword(v);
                setCurrentPasswordOk(false); // reset verification when user edits
                if (currentPasswordError) setCurrentPasswordError("");
              }}
              error={currentPasswordError}
            />
            {/* Verify status badge */}
            {verifying && (
              <Text size="1" style={{ color: "#6b7280", position: "absolute", right: 0, top: 0 }}>
                Checking...
              </Text>
            )}
            {currentPasswordOk && !verifying && (
              <Text size="1" style={{ color: "#16a34a", position: "absolute", right: 0, top: 0, fontWeight: 600 }}>
                ✓ Verified
              </Text>
            )}
          </div>

          {/* New password — disabled until current password is verified */}
          <PasswordInput
            id="newPassword"
            label="New Password"
            placeholder={currentPasswordOk ? "Enter new password (min 6 characters)" : "Verify current password first"}
            value={newPassword}
            disabled={!currentPasswordOk}
            onChange={(v) => { setNewPassword(v); if (newPasswordError) setNewPasswordError(""); }}
            error={newPasswordError}
          />

          {/* Confirm new password — disabled until current password is verified */}
          <PasswordInput
            id="confirmNewPassword"
            label={newPassword && confirmNewPassword && newPassword !== confirmNewPassword ? "Create New Password" : "Confirm New Password"}
            placeholder={currentPasswordOk ? "Re-enter new password" : "Verify current password first"}
            value={confirmNewPassword}
            disabled={!currentPasswordOk}
            onChange={(v) => { setConfirmNewPassword(v); if (confirmNewPasswordError) setConfirmNewPasswordError(""); }}
            error={confirmNewPasswordError}
          />
        </>
      )}

      {/* Active User — always last */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 36, marginTop: 4 }}>
        <Text size="2" weight="medium">Active User</Text>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>
    </>
  );

  return (
    <>
      {formError && (
        <div style={{ padding: "12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626", fontSize: "14px", marginBottom: "12px" }}>
          {formError}
        </div>
      )}

      {mode === "edit" && !isAdmin && (
        <div style={{ marginBottom: "12px" }}>
          <Text size="2" weight="medium" style={{ marginBottom: 4 }}>Company ID</Text>
          <TextField.Root value={initialValues?.companyId || ""} readOnly disabled size="2" radius="large" variant="surface" style={{ height: 35, fontSize: 13, opacity: 0.55 }} />
          <Text size="1" style={{ color: "#9ca3af", marginTop: 4 }}>Only an admin can change the Company ID</Text>
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
        }}
        submitText={mode === "edit" ? "Update User" : "Create User"}
        cancelText="Cancel"
        onCancel={() => navigate("/dashboard/users")}
        confirm={{
          title: mode === "edit" ? "Are you sure you want to update?" : "Are you absolutely sure?",
          description: mode === "edit" ? "This will update the user details." : "This action cannot be undone.",
          confirmText: mode === "edit" ? "Yes, Update" : "Yes, Create",
          cancelText: "No, go back",
        }}
        extraContent={extraContent}
        onBeforeSubmit={handleBeforeSubmit}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default AddUser;