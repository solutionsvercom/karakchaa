import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Trash2, Pencil, ChevronDown, MoreVertical } from "lucide-react";
import {
  Flex, Text, Badge, DropdownMenu, IconButton, Button, Dialog,
} from "@radix-ui/themes";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import Table, { Column } from "../../components/dynamicComponents/Table";
import AddExpense from "./AddExpense";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/Store";
import {
  fetchExpenses, fetchExpenseTotals, deleteExpense, type Expense,
} from "../../features/ExpensesSlice";

import {
  CalendarDays,
  IndianRupee,
  ListChecks
} from "lucide-react";

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    rent: "Rent", salary: "Salary", utilities: "Utilities",
    supplies: "Supplies", inventory: "Inventory", marketing: "Marketing",
    maintenance: "Maintenance", transport: "Transport", taxes: "Taxes", misc: "Miscellaneous",
  };
  return labels[category] || category;
};

const getCategoryColor = (category: string): "pink" | "cyan" | "orange" | "purple" | "green" | "blue" | "red" => {
  const colors: Record<string, any> = {
    rent: "purple", salary: "blue", utilities: "orange", supplies: "cyan",
    inventory: "pink", marketing: "green", maintenance: "orange",
    transport: "blue", taxes: "red", misc: "gray",
  };
  return colors[category] || "gray";
};

export default function Expenses() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { expenses, totals, loading, error } = useSelector((state: RootState) => state.expenses);
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All Categories");
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const isAdd = location.pathname.endsWith("/add-expense");
  const isDialogOpen = isAdd || !!editingExpense;

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchExpenseTotals());
  }, [dispatch]);

  const filteredExpenses = safeExpenses.filter((expense: Expense) => {
    const matchesSearch = `${expense.title} ${expense.vendor ?? ""} ${expense.category}`
      .toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All Categories" || getCategoryLabel(expense.category) === category;
    return matchesSearch && matchesCategory;
  });

  const columns: Column<Expense>[] = [
    {
      key: "title", header: "Title",
      render: (_: any, row: Expense) => <Text weight="medium">{row.title}</Text>,
    },
    {
      key: "category", header: "Category",
      render: (_: any, row: Expense) => (
        <Badge color={getCategoryColor(row.category)}>{getCategoryLabel(row.category)}</Badge>
      ),
    },
    {
      key: "vendor", header: "Vendor",
      render: (_: any, row: Expense) => <Text>{row.vendor ?? "-"}</Text>,
    },
    {
      key: "amount", header: "Amount",
      render: (_: any, row: Expense) => (
        <Text weight="medium" color="red">₹{Number(row.amount || 0).toLocaleString()}</Text>
      ),
    },
    {
      key: "paymentMethod", header: "Payment",
      render: (_: any, row: Expense) => (
        <Text size="2" style={{ textTransform: "capitalize" }}>
          {row.paymentMethod === "bank" ? "Bank Transfer" : row.paymentMethod.toUpperCase()}
        </Text>
      ),
    },
    {
      key: "date", header: "Date",
      render: (_: any, row: Expense) => (
        <Text size="2">
          {(() => {
            try {
              return new Date(row.date).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              });
            } catch { return row.date; }
          })()}
        </Text>
      ),
    },
    {
      key: "actions", header: "Actions",
      render: (_: any, row: Expense) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="soft" radius="full"><MoreVertical size={16} /></IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onClick={() => {
              navigate(`/dashboard/expenses/edit-expense/${row._id}`);
              setEditingExpense(row);
            }}>
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item color="red" onClick={() => setDeleteId(row._id)}>
              <Trash2 size={14} /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    },
  ];

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
        {error && <Text color="red" size="2">{error}</Text>}

        <div className="kb-summary-row">
          <SummaryCard
            title="This Month"
            value={`₹${totals?.thisMonthExpenses ?? 0}`}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon={<CalendarDays size={22} strokeWidth={2.2} />as any}
          />

          <SummaryCard
            title="Total Expenses"
            value={`₹${totals?.totalExpenses ?? 0}`}
            accentColor="#00C853"
            softColor="#E5F9EE"
            icon={<IndianRupee size={22} strokeWidth={2.2} /> as any}
          />

          <SummaryCard
            title="Total Records"
            value={String(totals?.totalTransactions ?? filteredExpenses.length)}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon={<ListChecks size={22} strokeWidth={2.2} />as any}
          />
        </div>

        <Flex align="center" gap="3" width="100%">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Searchbar searchValue={search} onSearchChange={setSearch} placeholder="Search expenses..." />
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">{category}<ChevronDown size={16} /></Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {["All Categories","Rent","Salary","Utilities","Supplies","Inventory","Marketing","Maintenance","Transport","Taxes","Miscellaneous"].map((item) => (
                <DropdownMenu.Item key={item} onClick={() => setCategory(item)}>{item}</DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <Button style={{ whiteSpace: "nowrap" }} onClick={() => navigate("/dashboard/expenses/add-expense")}>
            + Add Expense
          </Button>
        </Flex>

       <Table
         columns={columns}
         data={filteredExpenses}
         loading={loading}
         hoverable
         striped
         emptyMessage="No expenses found"
       />
      </Flex>

      {/* ===== ADD / EDIT DIALOG ===== */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) { setEditingExpense(null); navigate("/dashboard/expenses"); }
        }}
      >
        <Dialog.Content maxWidth="450px">
          <AddExpense
            key={editingExpense ? editingExpense._id : "create"}
            mode={editingExpense ? "edit" : "create"}
            initialValues={editingExpense ? editInitialValues : undefined}
            onClose={() => { setEditingExpense(null); navigate("/dashboard/expenses"); }}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* ===== DELETE CONFIRM DIALOG ===== */}
      <Dialog.Root open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <Dialog.Content maxWidth="380px" aria-describedby={undefined}>
          <Dialog.Title>Delete Expense?</Dialog.Title>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            This action cannot be undone. Are you sure you want to delete this expense?
          </p>
          <Flex justify="end" gap="3" mt="4">
            <Button
  variant="soft"
  color="gray"
  onClick={() => setDeleteId(null)}
>
  Cancel
</Button>
            <Button color="red" onClick={async () => {
              if (deleteId) {
                const res = await dispatch(deleteExpense(deleteId));
                if (deleteExpense.fulfilled.match(res)) {
                  dispatch(fetchExpenses());
                  dispatch(fetchExpenseTotals());
                  if (editingExpense?._id === deleteId) setEditingExpense(null);
                }
                setDeleteId(null);
              }
            }}>Delete</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}