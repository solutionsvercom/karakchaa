import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Trash2, Pencil, ChevronDown } from "lucide-react";
import {
  Flex,
  Text,
  Badge,
  DropdownMenu,
  Button,
  Dialog,
} from "@radix-ui/themes";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import Table, { Column } from "../../components/dynamicComponents/Table";
import AddExpense from "./AddExpense";

/* ================= TYPES ================= */

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  vendor: string;
  paymentMethod: string;
  date: string;
  notes?: string;
};

/* ================= DATA ================= */

export const mockExpenses: Expense[] = [
  {
    id: 1,
    title: "Tea Inventory",
    category: "inventory",
    amount: 15,
    vendor: "Assam Tea Distributors",
    paymentMethod: "bank",
    date: "2025-01-12",
    notes: "Monthly tea stock",
  },
  {
    id: 2,
    title: "Kitchen Supplies",
    category: "supplies",
    amount: 8500,
    vendor: "Fresh Foods Guwahati",
    paymentMethod: "cash",
    date: "2025-01-10",
  },
  {
    id: 3,
    title: "Electricity Bill",
    category: "utilities",
    amount: 4500,
    vendor: "APDCL",
    paymentMethod: "upi",
    date: "2025-01-05",
  },
  {
    id: 4,
    title: "Monthly Rent",
    category: "rent",
    amount: 1000,
    vendor: "Property Owner",
    paymentMethod: "bank",
    date: "2026-02-01",
  },
];

/* ================= HELPERS ================= */

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    rent: "Rent",
    salary: "Salary",
    utilities: "Utilities",
    supplies: "Supplies",
    inventory: "Inventory",
    marketing: "Marketing",
    maintenance: "Maintenance",
    transport: "Transport",
    taxes: "Taxes",
    misc: "Miscellaneous",
  };
  return labels[category] || category;
};

const getCategoryColor = (category: string): "pink" | "cyan" | "orange" | "purple" | "green" | "blue" | "red" => {
  const colors: Record<string, any> = {
    rent: "purple",
    salary: "blue",
    utilities: "orange",
    supplies: "cyan",
    inventory: "pink",
    marketing: "green",
    maintenance: "orange",
    transport: "blue",
    taxes: "red",
    misc: "gray",
  };
  return colors[category] || "gray";
};
 /* ================= CALCULATIONS ================= */

export type ExpenseTransaction = {
  amount: number;
  date: string | Date;
};

export const calculateExpenseTotals = (data: ExpenseTransaction[]) => {
  const now = new Date();

  const totalExpenses = data.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const thisMonthExpenses = data
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalTransactions = data.length;

  const averageExpense =
    totalTransactions > 0
      ? Math.round(totalExpenses / totalTransactions)
      : 0;

  return {
    totalExpenses,
    thisMonthExpenses,
    totalTransactions,
    averageExpense,
  };
};


/* ================= COMPONENT ================= */

export default function Expenses() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All Categories");

  const isAdd = location.pathname.endsWith("/add-expense");
  const isEdit = location.pathname.endsWith("/edit-expense");
  const isDialogOpen = isAdd || isEdit;

  const expenseToEdit = mockExpenses.find((e) => e.id === Number(id));

  /* ================= FILTER ================= */

  const filteredExpenses = mockExpenses.filter((expense) => {
    const matchesSearch = `${expense.title} ${expense.vendor} ${expense.category}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All Categories" ||
      getCategoryLabel(expense.category) === category;

    return matchesSearch && matchesCategory;
  });

 
  const { totalExpenses,
    thisMonthExpenses,
    totalTransactions,
    averageExpense,} =
      calculateExpenseTotals(filteredExpenses);

  /* ================= TABLE ================= */

  const columns: Column<Expense>[] = [
    {
      key: "title",
      header: "Title",
      render: (_, row) => <Text weight="medium">{row.title}</Text>,
    },
    {
      key: "category",
      header: "Category",
      render: (_, row) => (
        <Badge color={getCategoryColor(row.category)}>
          {getCategoryLabel(row.category)}
        </Badge>
      ),
    },
    {
      key: "vendor",
      header: "Vendor",
      accessor: "vendor",
    },
    {
      key: "amount",
      header: "Amount",
      render: (_, row) => (
        <Text weight="medium" color="red">
          ₹{row.amount.toLocaleString()}
        </Text>
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment",
      render: (_, row) => (
        <Text size="2" style={{ textTransform: "capitalize" }}>
          {row.paymentMethod === "bank" ? "Bank Transfer" : row.paymentMethod.toUpperCase()}
        </Text>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (_, row) => {
        const date = new Date(row.date);
        return (
          <Text size="2">
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" radius="full">
              <DotsVerticalIcon />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end">
            <DropdownMenu.Item
              onClick={() =>
                navigate(`/dashboard/expenses/${row.id}/edit-expense`)
              }
            >
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item color="red">
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
        {/* ===== SUMMARY ===== */}
        <div className="kb-summary-row">
          <SummaryCard
            title="This Month"
            value={`₹${thisMonthExpenses}`}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon="📦"
          />
          <SummaryCard
            title="Total Expenses"
            value={`₹${totalExpenses}`}
            accentColor="#00C853"
            softColor="#E5F9EE"
            icon="✅"
          />
          <SummaryCard
            title="Total Records"
            value={String(totalTransactions)}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon="⚠️"
          />
        </div>

        {/* ===== TOOLBAR ===== */}
        <Flex align="center" gap="3" width="100%">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Searchbar
              searchValue={search}
              onSearchChange={setSearch}
              placeholder="Search expenses..."
            />
          </div>

          {/* Category Filter */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">
                {category}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              {[
                "All Categories",
                "Rent",
                "Salary",
                "Utilities",
                "Supplies",
                "Inventory",
                "Marketing",
                "Maintenance",
                "Transport",
                "Taxes",
                "Miscellaneous",
              ].map((item) => (
                <DropdownMenu.Item key={item} onClick={() => setCategory(item)}>
                  {item}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Add Expense Button */}
          <Button
            style={{ whiteSpace: "nowrap" }}
            onClick={() => navigate("/dashboard/expenses/add-expense")}
          >
            + Add Expense
          </Button>
        </Flex>

        {/* ===== TABLE ===== */}
        <Table
          data={filteredExpenses}
          columns={columns}
          emptyMessage="No expenses found"
          hoverable
          striped
        />
      </Flex>

      {/* ===== ADD / EDIT DIALOG ===== */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/expenses");
        }}
      >
        <Dialog.Content maxWidth="450px">
          <AddExpense
            mode={isEdit ? "edit" : "create"}
            initialValues={isEdit ? expenseToEdit : undefined}
          />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}