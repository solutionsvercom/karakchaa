import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Flex, Text, Button, TextField, Select } from "@radix-ui/themes";
import { UserPlus, Save, X } from "lucide-react";

interface AddUserProps {
  mode: "create" | "edit";
  initialValues?: {
    name: string;
    email: string;
    role: string; // This is the role ID
    phoneNumber?: string;
  };
  userId?: string;
  roles: any[];
  onSuccess: () => void;
}

const AddUser = ({ mode, initialValues, userId, roles, onSuccess }: AddUserProps) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [form, setForm] = useState({
    name: initialValues?.name || "",
    email: initialValues?.email || "",
    password: "",
    role: initialValues?.role || "", // Store role ID
    phoneNumber: initialValues?.phoneNumber || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= UPDATE FORM ================= */
  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  /* ================= GET ROLE NAME BY ID ================= */
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    return role ? role.name : "";
  };

  /* ================= SUBMIT HANDLER ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please enter name and email");
      return;
    }

    if (mode === "create" && !form.password) {
      setError("Password is required");
      return;
    }

    if (mode === "create" && form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        name: form.name,
        email: form.email,
        role: form.role || "staff", // Send role ID
        phoneNumber: form.phoneNumber,
      };

      if (mode === "create") {
        payload.password = form.password;
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
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        {/* Title */}
        <Flex align="center" gap="2" mb="2">
          <UserPlus size={20} style={{ color: "#8b5cf6" }} />
          <Text size="5" weight="bold" style={{ color: "#1f2937" }}>
            {mode === "edit" ? "Edit User" : "Add New User"}
          </Text>
        </Flex>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: "12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        {/* Name Input */}
        <div>
          <Text size="2" weight="medium" mb="2" style={{ display: "block", color: "#374151" }}>
            Full Name *
          </Text>
          <TextField.Root
            placeholder="Enter full name"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            disabled={loading}
            style={{ width: "100%" }}
          />
        </div>

        {/* Email Input */}
        <div>
          <Text size="2" weight="medium" mb="2" style={{ display: "block", color: "#374151" }}>
            Email *
          </Text>
          <TextField.Root
            type="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            disabled={loading || mode === "edit"} // Can't change email in edit mode
            style={{ width: "100%" }}
          />
          {mode === "edit" && (
            <Text size="1" style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>
              Email cannot be changed
            </Text>
          )}
        </div>

        {/* Phone Number Input */}
        <div>
          <Text size="2" weight="medium" mb="2" style={{ display: "block", color: "#374151" }}>
            Phone Number
          </Text>
          <TextField.Root
            type="tel"
            placeholder="Enter phone number"
            value={form.phoneNumber}
            onChange={(e) => updateForm("phoneNumber", e.target.value)}
            disabled={loading}
            style={{ width: "100%" }}
          />
        </div>

        {/* Role Select */}
        <div>
          <Text size="2" weight="medium" mb="2" style={{ display: "block", color: "#374151" }}>
            Role
          </Text>
          <Select.Root
            value={form.role}
            onValueChange={(value) => updateForm("role", value)}
            disabled={loading}
          >
            <Select.Trigger 
              style={{ 
                width: "100%",
                cursor: loading ? "not-allowed" : "pointer"
              }}
              placeholder="Select role"
            />
            <Select.Content>
              <Select.Group>
                <Select.Label>Select Role</Select.Label>
                {roles.map(role => (
                  <Select.Item key={role._id} value={role._id}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
          {form.role && (
            <Text size="1" style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>
              Selected: {getRoleName(form.role)}
            </Text>
          )}
        </div>

        {/* Password Input (only for create mode) */}
        {mode === "create" && (
          <div>
            <Text size="2" weight="medium" mb="2" style={{ display: "block", color: "#374151" }}>
              Password *
            </Text>
            <TextField.Root
              type="password"
              placeholder="Enter password (min 6 characters)"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              disabled={loading}
              style={{ width: "100%" }}
            />
            <Text size="1" style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>
              Password must be at least 6 characters
            </Text>
          </div>
        )}

        {/* Action Buttons */}
        <Flex gap="3" justify="center" mt="2">
          <Button
            type="button"
            variant="soft"
            onClick={() => navigate("/dashboard/users")}
            disabled={loading}
            style={{
              background: "#f3f4f6",
              color: "#374151",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            <Save size={16} />
            {loading ? "Saving..." : mode === "edit" ? "Update User" : "Create User"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default AddUser;