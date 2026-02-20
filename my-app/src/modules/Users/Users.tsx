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
import Searchbar from "../../components/dynamicComponents/Searchbar";
import AddUser from "./AddUser";

/* ================= TYPES ================= */
type UserRow = {
  id: string;
  name: string;
  companyId: string;   // ✅ login credential
  email: string;       // contact only
  role: string;
  roleName: string;
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
  const [searchValue, setSearchValue] = useState("");

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

  /* ================= HELPER: Get Role Info ================= */
  const getRoleInfo = (userRole: any) => {
    if (typeof userRole === "object" && userRole !== null) {
      return { id: userRole._id || "", name: userRole.name || "Unknown" };
    }
    if (typeof userRole === "string") {
      const role = roles.find((r) => r._id === userRole);
      return { id: userRole, name: role ? role.name : "Unknown" };
    }
    return { id: "", name: "Unknown" };
  };

  /* ================= FORMAT USERS ================= */
  const formattedUsers: UserRow[] = users?.map((u) => {
    const roleInfo = getRoleInfo(u?.role);
    return {
      id: u?._id || "",
      name: u?.name || "",
      companyId: u?.companyId || "—",     // ✅
      email: u?.email || "",
      role: roleInfo.id,
      roleName: u?.roleName || roleInfo.name,
      phoneNumber: u?.phoneNumber || "",
      isActive: u?.isActive ?? true,
    };
  }) || [];

  /* ================= SEARCH (name, email, phone) ================= */
  const filteredUsers = formattedUsers.filter((u) =>
    `${u.name} ${u.email} ${u.phoneNumber}`
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  );

  /* ================= DELETE USER ================= */
  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"?`)) return;
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
            
          />
          <div>
            <Text weight="medium" style={{ display: "block",  }}>
              {row.name}
            </Text>
            <Text size="2">
              {row.email}
            </Text>
          </div>
        </Flex>
      ),
    },
    // ✅ Company ID column
    {
      key: "companyId",
      header: "Company ID",
      render: (_, row) => (
        <Text
          size="2"
          style={{
            color: "#374151",
            fontWeight: "500",
            fontFamily: "monospace",
            background: "#f3f4f6",
            padding: "3px 8px",
            borderRadius: "6px",
          }}
        >
          {row.companyId}
        </Text>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (_, row) => (
        <Flex align="center" gap="1">
          <div style={{
            padding: "4px 12px",
            background: "#ede9fe",
            color: "var(--accent-10)",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "500",
            textTransform: "capitalize",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <Shield size={12} />
            {row.roleName}
          </div>
        </Flex>
      ),
    },
    {
      key: "phone",
      header: "Phone Number",
      render: (_, row) => (
        <Text size="2" style={{ color: "#374151", background: "#f3f4f6", padding: "3px 8px",
            borderRadius: "6px", fontFamily: "monospace" }}>
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
          color: row.isActive ? "#0d9224" : "#dc2626",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: "500",
          display: "inline-block",
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
            <DropdownMenu.Item  onClick={() => navigate(`/dashboard/users/${row.id}/edit-user`)}>
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item color="red"
              onClick={() => handleDelete(row.id, row.name)}
              
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
        <Flex justify="between" align="center">
          <div>
            <Text size="6" weight="bold" style={{ display: "block", marginBottom: "4px",  }}>
              Users
            </Text>
            <Text size="2" >
              {filteredUsers.length} users found
            </Text>
          </div>
          <Button
            onClick={() => navigate("/dashboard/users/add-user")}
            style={{
             
              color: "white",
              cursor: "pointer",
            }}
          >
            + Add User
          </Button>
        </Flex>

        <div style={{ maxWidth: 420 }}>
          <Searchbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="Search users..."
          />
        </div>

        <Table
          data={filteredUsers}
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
                    companyId: userToEdit.companyId || "",   // ✅
                    email: userToEdit.email || "",
                    role: typeof userToEdit.role === "object"
                      ? userToEdit.role._id
                      : userToEdit.role,
                    phoneNumber: userToEdit.phoneNumber || "",
                    isActive: userToEdit.isActive ?? true,
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