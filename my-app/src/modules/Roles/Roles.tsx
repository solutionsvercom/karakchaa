import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Shield, Trash2, Pencil } from "lucide-react";
import axios from "axios";
import {
  Flex,
  Text,
  DropdownMenu,
  Button,
  Dialog,
} from "@radix-ui/themes";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import Table, { Column } from "../../components/dynamicComponents/Table";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import AddRole from "./AddRole";

/* ================= TYPES ================= */
type RoleRow = {
  id: string;
  name: string;
  modules: string[];
  moduleCount: number;
};

/* ================= COMPONENT ================= */
export default function Roles() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const isAdd = location.pathname.endsWith("/add-role");
  const isEdit = location.pathname.endsWith("/edit-role");
  const isDialogOpen = isAdd || isEdit;

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  /* ================= FETCH ROLES ================= */
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/roles", { headers });
      setRoles(res.data.roles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const roleToEdit = roles.find((r) => r._id === id);

  const formattedRoles: RoleRow[] = roles?.map((r) => ({
    id: r?._id || "",
    name: r?.name || "",
    modules: r?.modules || [],
    moduleCount: r?.modules?.length || 0,
  })) || [];

  /* ================= SEARCH ================= */
  const filteredRoles = formattedRoles.filter((r) =>
    `${r.name} ${r.modules.join(" ")}`
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  );

  /* ================= DELETE ROLE ================= */
  const handleDelete = async (roleId: string, roleName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${roleName}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/roles/${roleId}`, { headers });
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Failed to delete role");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns: Column<RoleRow>[] = [
    {
      key: "role",
      header: "Role Name",
      render: (_, row) => (
        <Flex align="center" gap="3">
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "var(--accent-10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)"
          }}>
            <Shield size={18}  />
          </div>
          <Text weight="medium" style={{ textTransform: "capitalize",  }}>
            {row.name}
          </Text>
        </Flex>
      ),
    },
    {
      key: "modules",
      header: "Modules",
      render: (_, row) => (
        <Flex gap="2" wrap="wrap">
          {row.modules.map((module: string) => (
            <span key={module} style={{
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: "500",
              background: "var(--accent-5)",
              borderRadius: "6px",
              textTransform: "capitalize"
            }}>
              {module}
            </span>
          ))}
        </Flex>
      ),
    },
    {
      key: "moduleCount",
      header: "Total Permissions",
      accessor: "moduleCount",
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
              onClick={() => navigate(`/dashboard/roles/${row.id}/edit-role`)}
            >
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
        {/* ===== PAGE TITLE ===== */}
        <Flex justify="between" align="center">
          <div>
            <Text size="6" weight="bold" style={{ display: "block", marginBottom: "4px",  }}>
              Roles
            </Text>
            <Text size="2">
              {filteredRoles.length} roles found
            </Text>
          </div>
          <Button
            onClick={() => navigate("/dashboard/roles/add-role")}
            style={{
             
              color: "white",
              cursor: "pointer"
            }}
          >
            + Add Role
          </Button>
        </Flex>

        {/* ===== SEARCH ===== */}
        <div style={{ maxWidth: 420 }}>
          <Searchbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="Search roles..."
          />
        </div>

        {/* ===== TABLE ===== */}
        <Table
          data={filteredRoles}
          columns={columns}
          emptyMessage="No roles found"
          hoverable
          striped
        />
      </Flex>

      {/* ===== ADD / EDIT DIALOG ===== */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/roles");
        }}
      >
        <Dialog.Content maxWidth="520px">
          <AddRole
            key={roleToEdit?._id || "create"}
            mode={isEdit ? "edit" : "create"}
            roleId={roleToEdit?._id}
            initialValues={
              roleToEdit
                ? {
                    name: roleToEdit.name,
                    modules: roleToEdit.modules,
                  }
                : undefined
            }
            onSuccess={fetchRoles}
          />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}