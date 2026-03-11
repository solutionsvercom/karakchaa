import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ROLES } from "../../config/Api";
import { Flex, Text, Checkbox, Button } from "@radix-ui/themes";
import { Shield, CheckCheck, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import DynamicAlertDialog from "../../components/dynamicComponents/DynamicAlertDialog";

const MODULES = [
  "dashboard",
  "pos",
  "products",
  "sales",
  "stockmanagement",
  "customer",
  "expenses",
  "suppliers",
  "employees",
  "reports",
  "users",
  "roles",
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
    setModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  /* ================= SELECT ALL ================= */
  const selectAllModules = () => {
    setModules(modules.length === MODULES.length ? [] : [...MODULES]);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
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
        await axios.put(`${API_ROLES}/${roleId}`, payload, { headers });
      } else {
        await axios.post(API_ROLES, payload, { headers });
      }

      onSuccess();
      navigate("/dashboard/roles");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" gap="4">

      {/* ===== TITLE (matches DynamicForm header) ===== */}
      <Flex justify="between" align="center" mb="0">
        <Flex align="center" gap="2">

          <Text weight="bold" size="4">
            {mode === "edit" ? "Edit Role" : "Add New Role"}
          </Text>
        </Flex>
        <Dialog.Close asChild>
          <Button variant="ghost" className="dialog-close-icon">
            <X size={18} />
          </Button>
        </Dialog.Close>
      </Flex>

      {/* ===== ERROR ===== */}
      {error && (
        <div style={{
          padding: "12px",

          border: "1px solid #fecaca",
          borderRadius: "8px",

          fontSize: "14px",
        }}>
          {error}
        </div>
      )}

      {/* ===== ROLE NAME ===== */}
      <div>
        <Text size="2" weight="medium" style={{ display: "block", marginBottom: 4, }}>
          Role Name <Text color="red">*</Text>
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

            // ✅ match customer form
            backgroundColor: "transparent",

            border: "1px solid var(--accent-6)",
            borderRadius: "8px",

            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--accent-9)";
            e.target.style.boxShadow = "0 0 0 1px var(--accent-9)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--accent-6)";
            e.target.style.boxShadow = "none";
          }}
        />

      </div>

      {/* ===== MODULES ===== */}
      <div>
        <Flex justify="between" align="center" mb="2">
          <Text size="2" weight="medium">
            Permissions <Text color="red">*</Text>{" "}
            <Text>({modules.length} selected)</Text>
          </Text>
          <Button
            type="button"
            variant="soft"
            size="1"
            onClick={selectAllModules}
            disabled={loading}
            style={{
              background: modules.length === MODULES.length ? "var(--accent-5)" : "var(--accent-2)",
              color: modules.length === MODULES.length ? "var(--accent-11)" : "var(--accent-11)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "12px",
              fontWeight: "600",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
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

          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "10px",
          }}>
            {MODULES.map((module) => (
              <label
                key={module}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: modules.includes(module) ? "var(--accent-5)" : "transparent",
                  border: modules.includes(module) ? "2px solid var(--accent-10)" : "2px solid var(--accent-3)",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  fontSize: "13px",
                  fontWeight: "500",
                  opacity: loading ? 0.6 : 1,

                }}
              >
                <Checkbox
                  checked={modules.includes(module)}
                  onCheckedChange={() => !loading && toggleModule(module)}
                  disabled={loading}
                  style={{ borderColor: modules.includes(module) ? "var(--accent-10)" : "var(--accent-3)" }}
                />
                <span style={{ textTransform: "capitalize" }}>{module}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FOOTER (matches DynamicForm footer) ===== */}
      <Flex mt="3" gap="2">
        <Dialog.Close asChild>
          <Button className="button outline" style={{ flex: 1 }} disabled={loading}>
            Cancel
          </Button>
        </Dialog.Close>

        <DynamicAlertDialog
          title={mode === "edit" ? "Are you sure you want to update?" : "Are you absolutely sure?"}
          description={
            mode === "edit"
              ? "This will update the role and its permissions."
              : "This action cannot be undone."
          }
          cancelText="No, go back"
          actionText={mode === "edit" ? "Yes, Update" : "Yes, Create"}
          onAction={handleSubmit}
        >
          <Button
            className="create-btn"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? "Saving..." : mode === "edit" ? "Update Role" : "Create Role"}
          </Button>
        </DynamicAlertDialog>
      </Flex>

    </Flex>
  );
};

export default AddRole;