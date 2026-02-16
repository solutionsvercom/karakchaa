import React, { useEffect, useState } from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import {
  Button,
  Flex,
  Badge,
  DropdownMenu,
  IconButton,
} from "@radix-ui/themes";
import { ChevronDown, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import Table, { Column } from "../../components/dynamicComponents/Table";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/Store";

import {
  fetchSales,
  deleteSale,
  Sale,
} from "../../features/SalesSlice";

/* ================= TYPES ================= */

type PaymentStatus = "pending" | "completed" | "cancelled";

type SaleTransaction = {
  id: number;
  invoice: string;
  customer: string;
  items: string;
  type: string;
  amount: number;
  payment: PaymentStatus;
  dateTime: string;
};

/* ================= HELPERS ================= */

const getPaymentColor = (status: PaymentStatus) => {
  switch (status) {
    case "completed":
      return "green";
    case "pending":
      return "yellow";
    case "cancelled":
      return "red";
  }
};

export const calculateTotals = (data: SaleTransaction[]) => {
  const totalRevenue = data.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = data.length;
  const averageOrder =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return { totalRevenue, totalOrders, averageOrder };
};

/* ================= COMPONENT ================= */

export default function Sales() {
  const dispatch = useDispatch<AppDispatch>();

  const { sales, loading } = useSelector(
    (state: RootState) => state.sales
  );

  const [searchValue, setSearchValue] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");

  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  /* 🔥 MAP BACKEND SALES TO TABLE FORMAT */
  const mappedSales: SaleTransaction[] = sales.map((s: Sale, index) => ({
    id: index,
    invoice: s.invoiceNumber,
    customer: s.product?.name || "Walk-in",
    items: s.product?.name || "-",
    type: s.paymentMethod,
    amount: s.totalAmount,
    payment: s.paymentStatus as PaymentStatus,
    dateTime: s.createdAt,
  }));

  const filteredSales = mappedSales.filter((sale) => {
    const matchesSearch =
      sale.invoice.toLowerCase().includes(searchValue.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchValue.toLowerCase());

    const matchesPayment =
      paymentFilter === "All Payments" ||
      sale.type.toLowerCase() === paymentFilter.toLowerCase();

    return matchesSearch && matchesPayment;
  });

  const { totalRevenue, totalOrders, averageOrder } =
    calculateTotals(filteredSales);

  /* ================= TABLE COLUMNS ================= */

  const columns: Column<SaleTransaction>[] = [
    { key: "invoice", header: "Invoice", accessor: "invoice" },
    { key: "customer", header: "Customer", accessor: "customer" },
    { key: "items", header: "Items", accessor: "items" },
    {
      key: "amount",
      header: "Amount",
      accessor: "amount",
      render: (value) => <strong>₹{value}</strong>,
    },
    {
      key: "payment",
      header: "Payment",
      accessor: "payment",
      render: (value: PaymentStatus) => (
        <Badge color={getPaymentColor(value)} variant="soft">
          {value}
        </Badge>
      ),
    },
    { key: "dateTime", header: "Date & Time", accessor: "dateTime" },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="soft" radius="full">
              <MoreVertical size={16} />
            </IconButton>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            <DropdownMenu.Item>
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>

            <DropdownMenu.Item>
              <Eye size={14} /> View
            </DropdownMenu.Item>

            <DropdownMenu.Item
              color="red"
              onClick={() =>
                dispatch(deleteSale(sales[row.id]._id))
              }
            >
              <Trash2 size={14} /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    },
  ];

  if (loading) return <div>Loading sales...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ================= SUMMARY ================= */}
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


      {/* ================= FILTER BAR ================= */}
      <Flex align="center" gap="3">
        <Flex style={{ flex: 1 }}>
          <Searchbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="Search by invoice or customer..."
          />
        </Flex>

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
                onSelect={() => setPaymentFilter(item)}
              >
                {item}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      {/* ================= TABLE ================= */}
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
