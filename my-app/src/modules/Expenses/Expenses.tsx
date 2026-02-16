import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/Store";
import {
  fetchExpenses,
  fetchExpenseTotals,
  deleteExpense,
  type Expense,
} from "../../features/ExpensesSlice";

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

const getCategoryColor = (
  category: string
): "pink" | "cyan" | "orange" | "purple" | "green" | "blue" | "red" => {
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

/* ================= (For Reports.tsx compatibility) ================= */

export type ExpenseTransaction = {
  amount: number;
  date: string | Date;
};

export const calculateExpenseTotals = (data: ExpenseTransaction[]) => {
  const now = new Date();

  const totalExpenses = (data || []).reduce(
    (sum, expense) => sum + Number((expense as any).amount || 0),
    0
  );

  const thisMonthExpenses = (data || [])
    .filter((expense) => {
      const expenseDate = new Date((expense as any).date);
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + Number((expense as any).amount || 0), 0);

  const totalTransactions = (data || []).length;
  const averageExpense =
    totalTransactions > 0 ? Math.round(totalExpenses / totalTransactions) : 0;

  return { totalExpenses, thisMonthExpenses, totalTransactions, averageExpense };
};

/* ================= COMPONENT ================= */

export default function Expenses() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<any>();

  const { expenses, totals, loading, error } = useSelector(
    (state: RootState) => state.expenses
  );

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All Categories");

  // ✅ Like Suppliers: keep the expense being edited in local state
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(
    null
  );

  const isAdd = location.pathname.endsWith("/add-expense");
  const isDialogOpen = isAdd || !!editingExpense;

  // load list + totals
  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchExpenseTotals());
  }, [dispatch]);

  /* ---------- SEARCH + FILTER ---------- */
  const filteredExpenses = safeExpenses.filter((expense: Expense) => {
    const matchesSearch = `${expense.title} ${expense.vendor ?? ""} ${
      expense.category
    }`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All Categories" ||
      getCategoryLabel(expense.category) === category;

    return matchesSearch && matchesCategory;
  });

  /* ---------- TABLE COLUMNS ---------- */
  const columns: Column<Expense>[] = [
    {
      key: "title",
      header: "Title",
      render: (_: any, row: Expense) => <Text weight="medium">{row.title}</Text>,
    },
    {
      key: "category",
      header: "Category",
      render: (_: any, row: Expense) => (
        <Badge color={getCategoryColor(row.category)}>
          {getCategoryLabel(row.category)}
        </Badge>
      ),
    },
    {
      key: "vendor",
      header: "Vendor",
      render: (_: any, row: Expense) => <Text>{row.vendor ?? "-"}</Text>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (_: any, row: Expense) => (
        <Text weight="medium" color="red">
          ₹{Number(row.amount || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment",
      render: (_: any, row: Expense) => (
        <Text size="2" style={{ textTransform: "capitalize" }}>
          {row.paymentMethod === "bank"
            ? "Bank Transfer"
            : row.paymentMethod.toUpperCase()}
        </Text>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (_: any, row: Expense) => {
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
      render: (_: any, row: Expense) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" radius="full">
              <DotsVerticalIcon />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end">
            {/* ✅ FIX: open edit using local state */}
            <DropdownMenu.Item onClick={() => setEditingExpense(row)}>
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>

            <DropdownMenu.Item
              color="red"
              onClick={async () => {
                const ok = window.confirm(
                  "Are you sure you want to delete this expense?"
                );
                if (!ok) return;

                const res = await dispatch(deleteExpense(row._id));
                if (deleteExpense.fulfilled.match(res)) {
                  dispatch(fetchExpenses());
                  dispatch(fetchExpenseTotals());
                  if (editingExpense?._id === row._id) setEditingExpense(null);
                }
              }}
            >
              <Trash2 size={14} /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    },
  ];

  // ✅ CRITICAL: DatePicker expects Date object → convert here
  const editInitialValues = React.useMemo(() => {
    if (!editingExpense) return undefined;

    return {
      ...editingExpense,
      date: editingExpense.date ? new Date(editingExpense.date) : new Date(),
      vendor: editingExpense.vendor ?? "",
      notes: editingExpense.notes ?? "",
    };
  }, [editingExpense]);

  return (
    <>
      <Flex direction="column" gap="5" width="100%">
        {error && (
          <Text color="red" size="2">
            {error}
          </Text>
        )}

        <div className="kb-summary-row">
          <SummaryCard
            title="This Month"
            value={`₹${totals?.thisMonthExpenses ?? 0}`}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon="📦"
          />
          <SummaryCard
            title="Total Expenses"
            value={`₹${totals?.totalExpenses ?? 0}`}
            accentColor="#00C853"
            softColor="#E5F9EE"
            icon="✅"
          />
          <SummaryCard
            title="Total Records"
            value={String(totals?.totalTransactions ?? filteredExpenses.length)}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon="⚠️"
          />
        </div>

        <Flex align="center" gap="3" width="100%">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Searchbar
              searchValue={search}
              onSearchChange={setSearch}
              placeholder="Search expenses..."
            />
          </div>

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

          <Button
            style={{ whiteSpace: "nowrap" }}
            onClick={() => navigate("/dashboard/expenses/add-expense")}
          >
            + Add Expense
          </Button>
        </Flex>

        <Table
  columns={columns}
  data={filteredExpenses}
  loading={loading}
  // emptyText="No expenses found."
  hoverable
  striped
/>

      </Flex>

      {/* ✅ Dialog opens for Add OR Edit */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingExpense(null);
            navigate("/dashboard/expenses");
          }
        }}
      >
        <Dialog.Content maxWidth="450px">
          <AddExpense
            key={editingExpense ? editingExpense._id : "create"} // ✅ remount form
            mode={editingExpense ? "edit" : "create"}
            initialValues={editingExpense ? editInitialValues : undefined}
            onClose={() => {
              setEditingExpense(null);
              navigate("/dashboard/expenses");
            }}
          />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
