import React from "react";
import {
  Flex, Button, Dialog, IconButton, DropdownMenu, Badge, Text,
} from "@radix-ui/themes";
import { Plus, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { fetchEmployees, deleteEmployee, fetchEmployeeStats } from "../../features/EmployeesSlice";
import type { Employee } from "../../features/EmployeesSlice";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import Table, { Column } from "../../components/dynamicComponents/Table";
import AddEmployee from "./AddEmployee";
import { SummaryCard } from "../../components/dynamicComponents/Cards";

const getRoleColor = (role: string): "yellow" | "green" | "orange" | "cyan" | "blue" | "gray" => {
  const map: Record<string, "yellow" | "green" | "orange" | "cyan" | "blue" | "gray"> = {
    staff: "yellow",
    cashier: "green",
    chef: "orange",
    delivery: "cyan",
    manager: "green",
    owner: "orange",
    admin: "blue",
  };
  return map[role?.toLowerCase()] ?? "gray";
};

export default function Employees() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const dispatch = useDispatch<AppDispatch>();
  const { employees, loading, stats } = useSelector((state: RootState) => state.employees);

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteName, setDeleteName] = React.useState<string>("");

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  React.useEffect(() => {
    dispatch(fetchEmployees(debouncedSearch));
    dispatch(fetchEmployeeStats());
  }, [dispatch, debouncedSearch]);

  const isAddEmployee = location.pathname.endsWith("add-employee");
  const isEditEmployee = location.pathname.endsWith("edit-employee");
  const isDialogOpen = isAddEmployee || isEditEmployee;

  const employeeToEdit = React.useMemo(() => {
    return employees.find((e) => String(e._id) === String(id));
  }, [employees, id]);

  const summary = React.useMemo(() => {
    if (stats) {
      return {
        total: stats.totalEmployees,
        active: stats.active,
        inactive: stats.inactive,
        salary: stats.totalSalary,
      };
    }

    const total = employees.length;
    const active = employees.filter((e) => e.active !== false).length;
    const inactive = employees.filter((e) => e.active === false).length;
    const salary = employees
      .filter((e) => e.active !== false)
      .reduce((sum, e) => sum + (e.salary || 0), 0);

    return { total, active, inactive, salary };
  }, [employees, stats]);

  const handleEdit = React.useCallback((id: string | undefined) => {
    if (!id) return;
    navigate(`/dashboard/employees/${id}/edit-employee`);
  }, [navigate]);

  const columns: Column<Employee>[] = React.useMemo(() => [
    { key: "name", header: "Employee", accessor: "name" },
    {
      key: "role",
      header: "Role",
      accessor: "role",
      render: (v: string) => (
        <Badge color={getRoleColor(v)} radius="full">
          {v}
        </Badge>
      ),
    },
    { key: "phone", header: "Contact", accessor: "phone" },
    {
      key: "salary",
      header: "Salary",
      accessor: "salary",
      render: (v) => `₹${v.toLocaleString()}`,
    },
    {
      key: "joinDate",
      header: "Join Date",
      accessor: "joinDate",
      render: (v: string) => {
        try {
          return new Date(v).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        } catch {
          return v;
        }
      },
    },
    {
      key: "active",
      header: "Status",
      accessor: "active",
      render: (v) => (
        <Badge color={v ? "green" : "red"} variant="soft">
          {v ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_v, row) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="soft" radius="full">
              <MoreVertical size={16} />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onClick={() => handleEdit(row._id)}>
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              color="red"
              onClick={() => {
                setDeleteId(row._id || null);
                setDeleteName(row.name || "");
              }}
            >
              <Trash2 size={14} /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    },
  ], [handleEdit]);

  return (
    <>
      <Flex direction="column" gap="5" width="100%">
        <div className="kb-summary-row">
          <SummaryCard
            title="Total Employees"
            value={String(summary.total)}
            accentColor="#7C4DFF"
            softColor="#F0E9FF"
            icon="👥"
          />
          <SummaryCard
            title="Active"
            value={String(summary.active)}
            accentColor="#00C853"
            softColor="#E5F9EE"
            icon="✅"
          />
          <SummaryCard
            title="Inactive"
            value={String(summary.inactive)}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon="⏸️"
          />
          <SummaryCard
            title="Monthly Salary"
            value={`₹${summary.salary.toLocaleString()}`}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon="₹"
          />
        </div>

        <Flex align="center" gap="3" width="100%">
          <div style={{ flex: 1 }}>
            <Searchbar
              searchValue={search}
              onSearchChange={setSearch}
              placeholder="Search employees..."
            />
          </div>
          <Button onClick={() => navigate("/dashboard/employees/add-employee")}>
            <Plus size={16} /> Add Employee
          </Button>
        </Flex>

        <Table
          data={employees}
          columns={columns}
          emptyMessage="No employees found"
          hoverable
          loading={loading}
        />
      </Flex>

      {/* ADD / EDIT DIALOG */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/employees");
        }}
      >
        <Dialog.Content maxWidth="480px">
          <Flex justify="between" align="center" mb="4">
            <Dialog.Title mb="0">
              {isEditEmployee ? "Edit Employee" : "Add Employee"}
            </Dialog.Title>
            <IconButton
              variant="ghost"
              color="gray"
              radius="full"
              type="button"
              onClick={() => navigate("/dashboard/employees")}
            >
              <X size={18} />
            </IconButton>
          </Flex>

          {isEditEmployee && !employeeToEdit ? (
            <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
          ) : (
            <AddEmployee
              key={employeeToEdit?._id || "create"}
              mode={isEditEmployee ? "edit" : "create"}
              initialValues={
                employeeToEdit
                  ? {
                      ...employeeToEdit,
                      joinDate: employeeToEdit.joinDate
                        ? new Date(employeeToEdit.joinDate)
                        : undefined,
                    }
                  : undefined
              }
            />
          )}
        </Dialog.Content>
      </Dialog.Root>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog.Root
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <Dialog.Content maxWidth="380px" aria-describedby={undefined}>
          <Dialog.Title>Delete Employee?</Dialog.Title>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Are you sure you want to delete <strong>{deleteName}</strong>? This
            action cannot be undone.
          </p>
          <Flex justify="end" gap="3" mt="4">
            <Button
              variant="soft"
              color="gray"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (deleteId) {
                  dispatch(deleteEmployee(deleteId));
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}