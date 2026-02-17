import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Flex, Text, Checkbox, Button } from "@radix-ui/themes";
import { Shield, CheckCheck } from "lucide-react";

const MODULES = [
  "dashboard",
  "pos",
  "products",
  "sales",
  "stockmanagement",
  "customers",
  "expenses",
  "suppliers",
  "employees",
  "reports",
  "users",
  "roles"
];

interface AddRoleProps {
  mode: "create" | "edit";
  initialValues?: {
    name: string;
    modules: string[];
  };
  roleId?: string;
  onSuccess: () => void;
}

const AddRole = ({ mode, initialValues, roleId, onSuccess }: AddRoleProps) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [name, setName] = useState(initialValues?.name || "");
  const [modules, setModules] = useState<string[]>(initialValues?.modules || []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= TOGGLE MODULE ================= */
  const toggleModule = (module: string) => {
    setModules(prev =>
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  /* ================= SELECT ALL MODULES ================= */
  const selectAllModules = () => {
    if (modules.length === MODULES.length) {
      // If all are selected, deselect all
      setModules([]);
    } else {
      // Select all
      setModules([...MODULES]);
    }
  };

  /* ================= SUBMIT HANDLER ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a role name");
      return;
    }

    if (modules.length === 0) {
      setError("Please select at least one module");
      return;
    }

    try {
      setLoading(true);
      const payload = { name, modules };

      if (mode === "edit" && roleId) {
        await axios.put(
          `http://localhost:5000/api/roles/${roleId}`,
          payload,
          { headers }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/roles",
          payload,
          { headers }
        );
      }

      onSuccess();
      navigate("/dashboard/roles");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        {/* Title */}
        <Flex align="center" gap="2" mb="2">
          <Shield size={20} style={{ color: "#8b5cf6" }} />
          <Text size="5" weight="bold" style={{ color: "#1f2937" }}>
            {mode === "edit" ? "Edit Role" : "Add New Role"}
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

        {/* Role Name Input */}
        <div>
          <Text size="2" weight="medium" mb="2" style={{ display: "block", color: "#374151" }}>
            Role Name *
          </Text>
          <input
            type="text"
            placeholder="Enter role name (e.g., Manager, Staff)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "14px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s",
              fontFamily: "inherit"
            }}
            onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        {/* Modules Selection */}
        <div>
          {/* ✅ Permissions Header with Select All Button */}
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="medium" style={{ color: "#374151" }}>
              Permissions * ({modules.length} selected)
            </Text>
            <Button
              type="button"
              variant="soft"
              size="1"
              onClick={selectAllModules}
              disabled={loading}
              style={{
                background: modules.length === MODULES.length ? "#ede9fe" : "#f3f4f6",
                color: modules.length === MODULES.length ? "#7c3aed" : "#374151",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: "600",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <CheckCheck size={14} />
              {modules.length === MODULES.length ? "Deselect All" : "Select All"}
            </Button>
          </Flex>

          <div style={{
            maxHeight: "280px",
            overflowY: "auto",
            padding: "12px",
            background: "#fafafa",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "10px"
            }}>
              {MODULES.map(module => (
                <label
                  key={module}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    background: modules.includes(module) ? "#ede9fe" : "white",
                    border: modules.includes(module) ? "2px solid #8b5cf6" : "2px solid #e5e7eb",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    fontSize: "13px",
                    fontWeight: "500",
                    opacity: loading ? 0.6 : 1,
                    color: modules.includes(module) ? "#7c3aed" : "#374151"
                  }}
                >
                  <Checkbox
                    checked={modules.includes(module)}
                    onCheckedChange={() => !loading && toggleModule(module)}
                    disabled={loading}
                    style={{
                      borderColor: modules.includes(module) ? "#8b5cf6" : "#d1d5db"
                    }}
                  />
                  <span style={{ textTransform: "capitalize" }}>{module}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Flex gap="3" mt="3" justify="center">
          <Button
            type="button"
            variant="soft"
            onClick={() => navigate("/dashboard/roles")}
            disabled={loading}
            style={{
              background: "#f3f4f6",
              color: "#374151",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
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
            {loading ? "Saving..." : mode === "edit" ? "Update Role" : "Create Role"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default AddRole;