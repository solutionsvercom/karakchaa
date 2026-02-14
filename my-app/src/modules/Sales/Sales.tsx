import React from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import { Button, Dialog, Flex, Badge, DropdownMenu, IconButton } from "@radix-ui/themes";
import { ChevronDown, UserPlus, X, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import Table, { Column } from "../../components/dynamicComponents/Table";
import { FormField } from "../../components/dynamicComponents/DynamicForm/types";
import { SummaryCard } from "../../components/dynamicComponents/Cards";

/* ================= TYPES ================= */

type PaymentStatus = "pending" | "completed" | "cancelled";
type SaleType = "cash" | "card" | "upi" | "check";

type SaleTransaction = {
  id: number;
  invoice: string;
  customer: string;
  items: string;
  type: SaleType;
  amount: number;
  payment: PaymentStatus;
  dateTime: string;
};

/* ================= MOCK DATA ================= */

export const mockSalesData: SaleTransaction[] = [
  { id: 1, 
    invoice: "INV-001",
     customer: "Rajesh Kumar", 
     items: "Tea", 
     type: "cash", 
     amount: 250,
      payment: "completed", 
    dateTime: "2026-02-10T14:30:00", },
  { id: 2,
     invoice: "INV-002", 
     customer: "Priya Singh", 
     items: "Tea", 
     type: "card",
      amount: 650, 
      payment: "completed",
     dateTime: "2026-01-29T16:15:00", },
  { id: 3, 
    invoice: "INV-003", 
    customer: "Amit Patel",
     items: "Samosa", 
     type: "upi", 
     amount: 80,
      payment: "pending", 
     dateTime: "2026-02-11T10:00:00", },
  { id: 4, 
    invoice: "INV-004", 
    customer: "Neha Sharma", 
    items: "Momos", 
    type: "cash",
     amount: 420,
      payment: "completed", 
     dateTime: "2025-08-30T10:00:00", },
  { id: 5, 
    invoice: "INV-005",
     customer: "Vikram Roy", 
     items: "Samosa",
      type: "card", 
      amount: 580, 
      payment: "cancelled",  
    dateTime: "2025-05-30T10:00:00",},
    {id: 6,
       invoice: "INV-006", 
       customer: "Ram Sharma", 
       items: "Coffee", 
       type: "card", 
       amount: 580,
        payment: "cancelled",  
    dateTime: "01-02-2026",
    },
    { id: 7, 
      invoice: "INV-007", 
      customer: "Mohit",
       items: "Samosa",
        type: "cash",
         amount: 2000, 
         payment: "cancelled",  
    dateTime: "2025-12-30T10:00:00",},
    {id: 8, 
      invoice: "INV-008",
       customer: "Rohit", 
       items: "Coffee", 
       type: "upi",
        amount: 300, 
        payment: "completed",  
    dateTime: "03-02-2026",
    },
    { 
    id: 1, 
    invoice: "INV-001", 
    customer: "Rajesh Kumar", 
    items: "Tea", 
    type: "cash", 
    amount: 250, 
    payment: "completed",
    dateTime: "2026-02-04T14:30:00", // Today
  },
  { 
    id: 2, 
    invoice: "INV-002", 
    customer: "Priya Singh", 
    items: "Tea", 
    type: "card", 
    amount: 650, 
    payment: "completed",
    dateTime: "2026-02-03T16:15:00", // Yesterday
  },
  { 
    id: 3, 
    invoice: "INV-003", 
    customer: "Amit Patel", 
    items: "Samosa", 
    type: "upi", 
    amount: 80, 
    payment: "pending",
    dateTime: "2026-02-02T10:00:00", // 2 days ago
  },
  { 
    id: 4, 
    invoice: "INV-004", 
    customer: "Neha Sharma", 
    items: "Momos", 
    type: "cash", 
    amount: 420, 
    payment: "completed",
    dateTime: "2026-02-01T10:00:00", // 3 days ago
  },
  { 
    id: 5, 
    invoice: "INV-005", 
    customer: "Vikram Roy", 
    items: "Samosa", 
    type: "card", 
    amount: 580, 
    payment: "cancelled",
    dateTime: "2026-01-31T10:00:00", // 4 days ago
  },
  { 
    id: 6, 
    invoice: "INV-006", 
    customer: "Ram Sharma", 
    items: "Coffee", 
    type: "card", 
    amount: 580, 
    payment: "cancelled",
    dateTime: "2026-01-30T09:00:00", // 5 days ago
  },
  { 
    id: 7, 
    invoice: "INV-007", 
    customer: "Mohit", 
    items: "Samosa", 
    type: "cash", 
    amount: 2000, 
    payment: "cancelled",
    dateTime: "2026-01-29T10:00:00", // 6 days ago
  },
  { 
    id: 8, 
    invoice: "INV-008", 
    customer: "Rohit", 
    items: "Coffee", 
    type: "upi", 
    amount: 300, 
    payment: "cancelled",
    dateTime: "2026-01-28T11:00:00", // 7 days ago
  },
  // Older data for testing other filters
  { 
    id: 9, 
    invoice: "INV-009", 
    customer: "Sanjay", 
    items: "Tea", 
    type: "cash", 
    amount: 150, 
    payment: "completed",
    dateTime: "2026-01-15T14:30:00", // 20 days ago
  },
  { 
    id: 10, 
    invoice: "INV-010", 
    customer: "Anita", 
    items: "Coffee", 
    type: "upi", 
    amount: 200, 
    payment: "completed",
    dateTime: "2025-12-30T10:00:00", // Last month
  },
];

/* ================= HELPERS ================= */

const getPaymentColor = (status: PaymentStatus): "green" | "yellow" | "red" => {
  switch (status) {
    case "completed":
      return "green";
    case "pending":
      return "yellow";
    case "cancelled":
      return "red";
  }
};


const getPaymentLabel = (status: PaymentStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const calculateTotals = (data: SaleTransaction[]) => {
  const totalRevenue = data.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = data.length;
  const averageOrder =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    

  return { totalRevenue, totalOrders, averageOrder };
};

const {
  totalRevenue,
  totalOrders,
  averageOrder,
} = calculateTotals(mockSalesData);

/* ================= TABLE COLUMNS ================= */

const columns: Column<SaleTransaction>[] = [
  { key: "invoice", header: "Invoice", accessor: "invoice", width: "12%" },
  { key: "customer", header: "Customer", accessor: "customer", width: "18%" },
  { key: "items", header: "Items", accessor: "items", width: "12%" },
  {
    key: "type",
    header: "Type",
    accessor: "type",
    render: (value) => <span style={{ textTransform: "capitalize" }}>{value}</span>,
    width: "12%",
  },
  {
    key: "amount",
    header: "Amount",
    accessor: "amount",
    render: (value) => <strong>₹{value}</strong>,
    width: "12%",
  },
  {
    key: "payment",
    header: "Payment",
    accessor: "payment",
    render: (value: PaymentStatus) => (
      <Badge color={getPaymentColor(value)} variant="soft">
        {getPaymentLabel(value)}
      </Badge>
    ),
    width: "14%",
  },
  { key: "dateTime", header: "Date & Time", accessor: "dateTime", width: "16%" },
  {
    key: "actions",
    header: "Actions",
    render: () => (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="soft" radius="full">
              <MoreVertical size={16} />
            </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item> <Pencil size={14} />Edit</DropdownMenu.Item>
          <DropdownMenu.Item><Eye size={14} />View Details</DropdownMenu.Item>
          <DropdownMenu.Item color="red"><Trash2 size={14} />Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ),
    width: "12%",
    align: "center",
  },
];

/* ================= MAIN ================= */

export default function Sales() {
  const [searchValue, setSearchValue] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState("Today");
  const [paymentFilter, setPaymentFilter] = React.useState("All Payments");
  const [sales] = React.useState<SaleTransaction[]>(mockSalesData);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoice.toLowerCase().includes(searchValue.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchValue.toLowerCase());

    const matchesPayment =
      paymentFilter === "All Payments" ||
      sale.type === paymentFilter.toLowerCase();

    return matchesSearch && matchesPayment;
  });

  const { totalRevenue, totalOrders, averageOrder } =
    calculateTotals(filteredSales);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* SUMMARY */}
      <section className="kb-summary-row">
        <SummaryCard
          title="Total Revenue"
          value={`₹${totalRevenue}`}
          subtitle={`${totalOrders} orders`}
          accentColor="#00C853"
          softColor="#E5F9EE"
          icon="₹"
        />
        <SummaryCard
          title="Total Orders"
          value={String(totalOrders)}
          accentColor="#2962FF"
          softColor="#E3F2FD"
          icon="📦"
        />
        <SummaryCard
          title="Average Order"
          value={`₹${averageOrder}`}
          accentColor="#FF9100"
          softColor="#FFF3E0"
          icon="📊"
        />
      </section>

      {/* FILTER BAR */}
      <div
        style={{
          padding: 12,
          borderRadius: 12,
          border: "1px solid var(--gray-6)",
          background: "var(--gray-1)",
        }}
      >
        <Flex align="center" gap="3">
          <Flex style={{ flex: 1, minWidth: 0 }}>
            <Searchbar
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              placeholder="Search by invoice or customer..."
            />
          </Flex>

          {/* DATE FILTER */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">
                {dateFilter}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {["Today", "This Week", "This Month"].map((item) => (
                <DropdownMenu.Item
                  key={item}
                  onClick={() => setDateFilter(item)}
                >
                  {item}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* PAYMENT FILTER */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">
                {paymentFilter}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {["All Payments", "cash", "card", "upi"].map((item) => (
                <DropdownMenu.Item
                  key={item}
                  onClick={() => setPaymentFilter(item)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </div>

      {/* TABLE */}
      <Table<SaleTransaction>
        data={filteredSales}
        columns={columns}
        emptyMessage="No sales found"
        hoverable
        striped
      />
    </div>
  );
}
export const salesSummary = {
  totalRevenue,
  totalOrders,
  averageOrder,
};
