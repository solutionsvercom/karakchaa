import { Button, Dialog, Flex, Box, Text, Badge, DropdownMenu, Select } from "@radix-ui/themes";
import { UserPlus, X, MoreVertical } from "lucide-react";
import { useState } from "react";
import Form, { FormField } from "../../components/dynamicComponents/Form";
import Table, { Column } from "../../components/dynamicComponents/Table";

/* ================= TYPES ================= */

type PaymentStatus = "pending" | "completed" | "cancelled";
type SaleType = "cash" | "card" | "upi" | "check";

type SaleTransaction = {
  id: number;
  invoice: string;
  customer: string;
  items: string; // "3 items" or similar
  type: SaleType;
  amount: number;
  payment: PaymentStatus;
  dateTime: string;
};

/* ================= FORM FIELDS ================= */

const SalesFields: FormField[] = [
  { name: "customerName", label: "Customer Name", type: "text", placeholder: "Enter customer name", required: true },
  { name: "invoice", label: "Invoice Number", type: "text", placeholder: "Auto-generated", required: false },
  { name: "items", label: "Number of Items", type: "text", placeholder: "Enter number of items", required: true },
  { name: "amount", label: "Total Amount", type: "text", placeholder: "Enter total amount", required: true },
  { name: "description", label: "Description", type: "textarea", placeholder: "Add sale notes..." },
];

/* ================= MOCK DATA ================= */

const mockSalesData: SaleTransaction[] = [
  { id: 1, invoice: "INV-001", customer: "Rajesh Kumar", items: "2 items", type: "cash", amount: 250, payment: "completed", dateTime: "29 Jan, 2:30 PM" },
  { id: 2, invoice: "INV-002", customer: "Priya Singh", items: "5 items", type: "card", amount: 650, payment: "completed", dateTime: "29 Jan, 4:15 PM" },
  { id: 3, invoice: "INV-003", customer: "Amit Patel", items: "1 item", type: "upi", amount: 80, payment: "pending", dateTime: "30 Jan, 10:00 AM" },
  { id: 4, invoice: "INV-004", customer: "Neha Sharma", items: "3 items", type: "cash", amount: 420, payment: "completed", dateTime: "30 Jan, 11:45 AM" },
  { id: 5, invoice: "INV-005", customer: "Vikram Roy", items: "4 items", type: "card", amount: 580, payment: "cancelled", dateTime: "30 Jan, 1:20 PM" },
];

/* ================= HELPER FUNCTIONS ================= */

const getPaymentColor = (status: PaymentStatus): "green" | "yellow" | "red" => {
  switch (status) {
    case "completed":
      return "green";
    case "pending":
      return "yellow";
    case "cancelled":
      return "red";
    default:
      return "red";
  }
};

const getPaymentLabel = (status: PaymentStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const calculateTotals = (data: SaleTransaction[]) => {
  const totalRevenue = data.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = data.length;
  const averageOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  return { totalRevenue, totalOrders, averageOrder };
};

/* ================= COLUMNS ================= */

const columns: Column<SaleTransaction>[] = [
  {
    key: "invoice",
    header: "Invoice",
    accessor: "invoice",
    width: "12%",
  },
  {
    key: "customer",
    header: "Customer",
    accessor: "customer",
    width: "18%",
  },
  {
    key: "items",
    header: "Items",
    accessor: "items",
    width: "12%",
  },
  {
    key: "type",
    header: "Type",
    accessor: "type",
    render: (value) => (
      <Text size="2" weight="medium" style={{ textTransform: "capitalize" }}>
        {value}
      </Text>
    ),
    width: "12%",
  },
  {
    key: "amount",
    header: "Amount",
    accessor: "amount",
    render: (value) => <Text weight="bold">₹{value}</Text>,
    width: "12%",
    align: "right",
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
  {
    key: "dateTime",
    header: "Date & Time",
    accessor: "dateTime",
    width: "16%",
  },
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

/* ================= COMPONENT ================= */

export default function SalesModule() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");
  const [sales] = useState<SaleTransaction[]>(mockSalesData);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.invoice.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = paymentFilter === "all" || sale.payment === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const { totalRevenue, totalOrders, averageOrder } = calculateTotals(filteredSales);

  return (
    <Flex direction="column" gap="5">
      {/* ================= STATS SECTION ================= */}
      <Flex gap="4" wrap="wrap">
        {/* Total Revenue */}
        <Box
          style={{
            flex: "1 1 300px",
            padding: "24px",
            background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <Text size="2" style={{ opacity: 0.9, marginBottom: "8px" }}>
            Total Revenue
          </Text>
          <Text size="8" weight="bold" style={{ fontSize: "36px", margin: 0 }}>
            ₹{totalRevenue}
          </Text>
        </Box>

        {/* Total Orders */}
        <Box
          style={{
            flex: "1 1 300px",
            padding: "24px",
            background: "var(--gray-2)",
            borderRadius: "12px",
          }}
        >
          <Text size="2" color="gray" style={{ marginBottom: "8px" }}>
            Total Orders
          </Text>
          <Text size="8" weight="bold" style={{ fontSize: "36px", margin: 0 }}>
            {totalOrders}
          </Text>
        </Box>

        {/* Average Order */}
        <Box
          style={{
            flex: "1 1 300px",
            padding: "24px",
            background: "var(--gray-2)",
            borderRadius: "12px",
          }}
        >
          <Text size="2" color="gray" style={{ marginBottom: "8px" }}>
            Average Order
          </Text>
          <Text size="8" weight="bold" style={{ fontSize: "36px", margin: 0 }}>
            ₹{averageOrder}
          </Text>
        </Box>
      </Flex>

      {/* ================= HEADER ================= */}
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        <input
          type="text"
          placeholder="Search by invoice or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "250px",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid var(--gray-7)",
            fontSize: "14px",
          }}
        />

        <Select.Root value={dateFilter} onValueChange={setDateFilter}>
          <Select.Trigger placeholder="Today" style={{ minWidth: "120px" }} />
          <Select.Content>
            <Select.Item value="today">Today</Select.Item>
            <Select.Item value="week">This Week</Select.Item>
            <Select.Item value="month">This Month</Select.Item>
            <Select.Item value="all">All Time</Select.Item>
          </Select.Content>
        </Select.Root>

        <Select.Root value={paymentFilter} onValueChange={(val) => setPaymentFilter(val as typeof paymentFilter)}>
          <Select.Trigger placeholder="All Payments" style={{ minWidth: "140px" }} />
          <Select.Content>
            <Select.Item value="all">All Payments</Select.Item>
            <Select.Item value="completed">Completed</Select.Item>
            <Select.Item value="pending">Pending</Select.Item>
            <Select.Item value="cancelled">Cancelled</Select.Item>
          </Select.Content>
        </Select.Root>

        <Dialog.Root>
          <Dialog.Trigger>
            <Button>+ Add Sale</Button>
          </Dialog.Trigger>

          <Dialog.Content maxWidth="420px">
            <Flex justify="between" align="center" mb="4">
              <Flex align="center" gap="2">
                <UserPlus size={18} />
                <Dialog.Title style={{ fontSize: 18, fontWeight: 500 }}>
                  Add New Sale
                </Dialog.Title>
              </Flex>

              <Dialog.Close>
                <Button className="dialog-close-icon">
                  <X size={18} />
                </Button>
              </Dialog.Close>
            </Flex>

            <Form fields={SalesFields} />

            <Flex mt="4" gap="3">
              <Dialog.Close>
                <Button className="button outline" style={{ flex: 1 }}>
                  Cancel
                </Button>
              </Dialog.Close>

              <Dialog.Close>
                <Button style={{ flex: 1 }} onClick={() => console.log("Sale created")}>
                  Create Sale
                </Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      {/* ================= TABLE SECTION ================= */}
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2">
          <Text size="4" weight="bold">Sales Transactions</Text>
        </Flex>

        <Table<SaleTransaction>
          data={filteredSales}
          columns={columns}
          emptyMessage="No sales found"
          hoverable
          striped
        />
      </Flex>
    </Flex>
  );
}
