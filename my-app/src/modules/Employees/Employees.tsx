// modules/Employees/Employees.tsx
import React from "react";
import {
  Flex,
  Button,
  Text,
  Dialog,
  IconButton,
  DropdownMenu,
  Badge,
} from "@radix-ui/themes";
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import Searchbar from "../../components/dynamicComponents/Searchbar";
import Table, { Column } from "../../components/dynamicComponents/Table";
import AddEmployee from "./AddEmployee";
import { SummaryCard } from "../../components/dynamicComponents/Cards";

/* ================= TYPES ================= */

type Role = "staff" | "cashier" | "chef" | "delivery";

type Employee = {
  id: number;
  name: string;
  role: Role;
  phone: string;
  salary: number;
  joinDate: string;
  status: "Active" | "Inactive";
};

/* ================= DUMMY DATA ================= */

const employeesData: Employee[] = [
  {
    id: 1,
    name: "Nitu Deka",
    role: "staff",
    phone: "9900000004",
    salary: 15000,
    joinDate: "15 Apr 2024",
    status: "Active",
  },
  {
    id: 2,
    name: "Meera Kalita",
    role: "cashier",
    phone: "9900000002",
    salary: 18000,
    joinDate: "01 Mar 2024",
    status: "Active",
  },
  {
    id: 3,
    name: "Rajan Choudhury",
    role: "chef",
    phone: "9900000003",
    salary: 22000,
    joinDate: "01 Feb 2024",
    status: "Active",
  },
  {
    id: 4,
    name: "Kamal Sarma",
    role: "delivery",
    phone: "9900000005",
    salary: 12000,
    joinDate: "01 May 2024",
    status: "Active",
  },
];

/* ================= ROLE BADGES ================= */

const roleColorMap: Record<Role, "yellow" | "green" | "orange" | "cyan"> = {
  staff: "yellow",
  cashier: "green",
  chef: "orange",
  delivery: "cyan",
};

/* ================= COMPONENT ================= */

export default function Employees() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = React.useState("");

  const isAddEmployee = location.pathname.endsWith("/add-employee");
  const isEditEmployee = location.pathname.includes("/edit-employee/");

  /* ===== SUMMARY CARD CALCULATIONS ===== */

  const totalEmployees = employeesData.length;
  const activeEmployees = employeesData.filter(
    (e) => e.status === "Active"
  ).length;
  const monthlySalary = employeesData.reduce(
    (sum, e) => sum + e.salary,
    0
  );

  /* ================= TABLE COLUMNS ================= */

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
      key: "status",
      header: "Status",
      accessor: "status",
      render: (v: Role) => (
        <Badge color="green" variant="soft">
          {v}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="ghost">
              <MoreVertical size={16} />
            </IconButton>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end">
            <DropdownMenu.Item
              onClick={() =>
                navigate(`/dashboard/employees/edit-employee/${row.id}`)
              }
            >
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>

            <DropdownMenu.Item
              color="red"
              onClick={() => console.log("Delete employee:", row.id)}
            >
              <Trash2 size={14} /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    },
  ];

  /* ================= FILTER ================= */

  const filteredEmployees = employeesData.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= UI ================= */

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Flex justify="between" align="center">
          <Text size="5" weight="bold">
            Employees
          </Text>
        </Flex>

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
            title="Monthly Salary"
            value={`₹${monthlySalary.toLocaleString()}`}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon="₹"
          />
        </div>

        <Flex align="center" justify="between" gap="3">
          <div style={{ flex: 1, maxWidth: 420 }}>
            <Searchbar
              searchValue={search}
              onSearchChange={setSearch}
              placeholder="Search employees..."
            />
          </div>

          <Button
            onClick={() =>
              navigate("/dashboard/employees/add-employee")
            }
          >
            <Plus size={16} /> Add Employee
          </Button>
        </Flex>

        <Table
          data={filteredEmployees}
          columns={columns}
          emptyMessage="No employees found"
          hoverable
        />
      </div>

      <Dialog.Root
        open={isAddEmployee || isEditEmployee}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/employees");
        }}
      >
        <Dialog.Content maxWidth="480px">
          <AddEmployee />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
