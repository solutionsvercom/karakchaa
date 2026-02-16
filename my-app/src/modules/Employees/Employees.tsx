// modules/Employees/Employees.tsx
import React from "react";
import {
  Flex,
  Button,
  Dialog,
  IconButton,
  DropdownMenu,
  Badge,
} from "@radix-ui/themes";
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import {
  fetchEmployees,
  deleteEmployee,
} from "../../features/EmployeesSlice";
import type { Employee } from "../../features/EmployeesSlice";

import Searchbar from "../../components/dynamicComponents/Searchbar";
import Table, { Column } from "../../components/dynamicComponents/Table";
import AddEmployee from "./AddEmployee";
import { SummaryCard } from "../../components/dynamicComponents/Cards";

/* ================= TYPES ================= */

type Role =
  | "staff"
  | "manager"
  | "owner"
  | "cashier"
  | "chef"
  | "delivery";

/* ================= ROLE BADGES ================= */

const roleColorMap: Record<Role, "yellow" | "green" | "orange" | "cyan"> = {
  staff: "yellow",
  cashier: "green",
  chef: "orange",
  delivery: "cyan",
  manager: "green",
  owner: "orange",
};

/* ================= COMPONENT ================= */

export default function Employees() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const dispatch = useDispatch<AppDispatch>();
  const { employees, loading } = useSelector(
    (state: RootState) => state.employees
  );

  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    dispatch(fetchEmployees(search));
  }, [dispatch, search]);

  const isAddEmployee = location.pathname.endsWith("/add-employee");
  const isEditEmployee = location.pathname.includes("/edit-employee/");
  const isDialogOpen = isAddEmployee || isEditEmployee;

  const employeeToEdit = employees.find((e) => e._id === id);

  /* ================= SUMMARY ================= */

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (e) => e.active !== false
  ).length;
  const inactiveEmployees = employees.filter(
    (e) => e.active === false
  ).length;
  const monthlySalary = employees.reduce(
    (sum, e) => sum + (e.salary || 0),
    0
  );

  /* ================= TABLE ================= */

  const columns: Column<Employee>[] = [
    {
      key: "name",
      header: "Employee",
      accessor: "name",
    },
    {
      key: "role",
      header: "Role",
      accessor: "role",
      render: (v: Role) => (
        <Badge color={roleColorMap[v]} radius="full">
          {v}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      accessor: "phone",
    },
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
            <DropdownMenu.Item
              onClick={() =>
                navigate(
                  `/dashboard/employees/edit-employee/${row._id}`
                )
              }
            >
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>

            <DropdownMenu.Item
              color="red"
              onClick={() =>
                dispatch(deleteEmployee(row._id!))
              }
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
        {/* SUMMARY CARDS */}
        <div className="kb-summary-row">
          <SummaryCard
            title="Total Employees"
            value={String(totalEmployees)}
            accentColor="#7C4DFF"
            softColor="#F0E9FF"
            icon="👥"
          />
          <SummaryCard
            title="Active"
            value={String(activeEmployees)}
            accentColor="#00C853"
            softColor="#E5F9EE"
            icon="✅"
          />
          <SummaryCard
            title="Inactive"
            value={String(inactiveEmployees)}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon="⏸️"
          />
          <SummaryCard
            title="Monthly Salary"
            value={`₹${monthlySalary.toLocaleString()}`}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon="₹"
          />
        </div>

        {/* SEARCH + ADD */}
        <Flex align="center" gap="3" width="100%">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Searchbar
              searchValue={search}
              onSearchChange={setSearch}
              placeholder="Search employees..."
            />
          </div>

          <Button
            style={{ whiteSpace: "nowrap" }}
            onClick={() =>
              navigate("/dashboard/employees/add-employee")
            }
          >
            <Plus size={16} /> Add Employee
          </Button>
        </Flex>

        {/* TABLE */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            Loading...
          </div>
        ) : (
          <Table
            data={employees}
            columns={columns}
            emptyMessage="No employees found"
            hoverable
          />
        )}
      </Flex>

      {/* DIALOG */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/employees");
        }}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>
            {isEditEmployee ? "Edit Employee" : "Add Employee"}
          </Dialog.Title>

          <Dialog.Description>
            {isEditEmployee
              ? "Update employee details below."
              : "Fill in the details to create a new employee."}
          </Dialog.Description>

          <AddEmployee
            mode={isEditEmployee ? "edit" : "create"}
            initialValues={
              isEditEmployee ? employeeToEdit || {} : {}
            }
          />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
