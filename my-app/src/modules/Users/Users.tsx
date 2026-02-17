import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Users as UsersIcon, Trash2, Pencil, Shield } from "lucide-react";
import axios from "axios";
import {
  Flex,
  Text,
  DropdownMenu,
  Button,
  Dialog,
  Avatar,
} from "@radix-ui/themes";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import Table, { Column } from "../../components/dynamicComponents/Table";
import AddUser from "./AddUser";

/* ================= TYPES ================= */
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleName: string; // ✅ Added roleName
  phoneNumber?: string;
  isActive: boolean;
};

/* ================= COMPONENT ================= */
export default function Users() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdd = location.pathname.endsWith("/add-user");
  const isEdit = location.pathname.endsWith("/edit-user");
  const isDialogOpen = isAdd || isEdit;

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/auth/users", { headers });
      setUsers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH ROLES ================= */
  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/roles", { headers });
      setRoles(res.data.roles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const userToEdit = users.find((u) => u._id === id);

  /* ================= HELPER: Get Role Name by ID ================= */
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    return role ? role.name : roleId; // Fallback to roleId if not found
  };

  const formattedUsers: UserRow[] = users?.map((u) => ({
    id: u?._id || "",
    name: u?.name || "",
    email: u?.email || "",
    role: u?.role || "",
    roleName: getRoleName(u?.role) || u?.role || "", // ✅ Get role name
    phoneNumber: u?.phoneNumber || "",
    isActive: u?.isActive ?? true,
  })) || [];

  /* ================= DELETE USER ================= */
  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, { headers });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns: Column<UserRow>[] = [
    {
      key: "user",
      header: "User",
      render: (_, row) => (
        <Flex align="center" gap="3">
          <Avatar 
            fallback={row.name[0]?.toUpperCase() || "U"} 
            radius="full"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              color: "white"
            }}
          />
          <div>
            <Text weight="medium" style={{ display: "block", color: "#1f2937" }}>
              {row.name}
            </Text>
            <Text size="2" style={{ color: "#6b7280" }}>
              {row.email}
            </Text>
          </div>
        </Flex>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (_, row) => (
        <Flex align="center" gap="2">
          <div style={{
            padding: "4px 12px",
            background: "#ede9fe",
            color: "#7c3aed",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "500",
            textTransform: "capitalize",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <Shield size={12} />
            {row.roleName} {/* ✅ Display roleName instead of role */}
          </div>
        </Flex>
      ),
    },
    {
      key: "phone",
      header: "Phone Number",
      render: (_, row) => (
        <Text size="2" style={{ color: "#374151" }}>
          {row.phoneNumber || "—"}
        </Text>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => (
        <div style={{
          padding: "4px 10px",
          background: row.isActive ? "#ecfdf5" : "#fef2f2",
          color: row.isActive ? "#059669" : "#dc2626",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: "500",
          display: "inline-block"
        }}>
          {row.isActive ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" radius="full" style={{ cursor: "pointer" }}>
              <DotsVerticalIcon />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end">
            <DropdownMenu.Item
              onClick={() => navigate(`/dashboard/users/${row.id}/edit-user`)}
            >
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => handleDelete(row.id, row.name)}
              style={{ color: "#dc2626" }}
            >
              <Trash2 size={14} /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    },
  ];

  /* ================= UI ================= */
  return (
    <>
      <Flex direction="column" gap="5" width="100%">
        {/* ===== PAGE TITLE ===== */}
        <Flex justify="between" align="center">
          <div>
            <Text size="6" weight="bold" style={{ display: "block", marginBottom: "4px", color: "#1f2937" }}>
              Users
            </Text>
            <Text size="2" style={{ color: "#6b7280" }}>
              Manage system users and their access
            </Text>
          </div>
          <Button 
            onClick={() => navigate("/dashboard/users/add-user")}
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              color: "white",
              cursor: "pointer"
            }}
          >
            + Add User
          </Button>
        </Flex>

        {/* ===== TABLE ===== */}
        <Table
          data={formattedUsers}
          columns={columns}
          emptyMessage="No users found"
          hoverable
          striped
        />
      </Flex>

      {/* ===== ADD / EDIT DIALOG ===== */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/users");
        }}
      >
        <Dialog.Content maxWidth="520px">
          <AddUser
            key={userToEdit?._id || "create"}
            mode={isEdit ? "edit" : "create"}
            userId={userToEdit?._id}
            initialValues={
              userToEdit
                ? {
                    name: userToEdit.name,
                    email: userToEdit.email,
                    role: userToEdit.role,
                    phoneNumber: userToEdit.phoneNumber || "",
                  }
                : undefined
            }
            roles={roles}
            onSuccess={fetchUsers}
          />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}