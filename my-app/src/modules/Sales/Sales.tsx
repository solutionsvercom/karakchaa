import React from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import { Button, Dialog, Flex, Badge, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown, UserPlus, X, MoreVertical } from "lucide-react";
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

const mockSalesData: SaleTransaction[] = [
  { id: 1, invoice: "INV-001", customer: "Rajesh Kumar", items: "2 items", type: "cash", amount: 250, payment: "completed", dateTime: "29 Jan, 2:30 PM" },
  { id: 2, invoice: "INV-002", customer: "Priya Singh", items: "5 items", type: "card", amount: 650, payment: "completed", dateTime: "29 Jan, 4:15 PM" },
  { id: 3, invoice: "INV-003", customer: "Amit Patel", items: "1 item", type: "upi", amount: 80, payment: "pending", dateTime: "30 Jan, 10:00 AM" },
  { id: 4, invoice: "INV-004", customer: "Neha Sharma", items: "3 items", type: "cash", amount: 420, payment: "completed", dateTime: "30 Jan, 11:45 AM" },
  { id: 5, invoice: "INV-005", customer: "Vikram Roy", items: "4 items", type: "card", amount: 580, payment: "cancelled", dateTime: "30 Jan, 1:20 PM" },
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

const calculateTotals = (data: SaleTransaction[]) => {
  const totalRevenue = data.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = data.length;
  const averageOrder =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return { totalRevenue, totalOrders, averageOrder };
};

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
          <Button variant="ghost" size="1">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Edit</DropdownMenu.Item>
          <DropdownMenu.Item>View Details</DropdownMenu.Item>
          <DropdownMenu.Item color="red">Delete</DropdownMenu.Item>
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
