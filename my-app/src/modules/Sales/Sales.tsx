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
import { DotsVerticalIcon } from "@radix-ui/react-icons";
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
    case "completed": return "green";
    case "pending":   return "yellow";
    case "cancelled": return "red";
  }
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export const calculateTotals = (data: SaleTransaction[]) => {
  const totalRevenue = data.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = data.length;
  const averageOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  return { totalRevenue, totalOrders, averageOrder };
};

/* ================= COMPONENT ================= */

export default function Sales() {
  const dispatch = useDispatch<AppDispatch>();
  const { sales, loading } = useSelector((state: RootState) => state.sales);

  const [searchValue, setSearchValue] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");

  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  const mappedSales: SaleTransaction[] = sales.map((s: Sale, index) => ({
    id: index,
    invoice: s.invoiceNumber,
    customer: s.customer?.fullName || s.customerName || "Walk-in", // ✅ real customer name
    items: s.product?.name || "-",
    type: s.paymentMethod,   // ✅ Cash / Card / UPI
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

  const { totalRevenue, totalOrders, averageOrder } = calculateTotals(filteredSales);

  /* ================= TABLE COLUMNS ================= */

  const columns: Column<SaleTransaction>[] = [
    { key: "invoice",  header: "Invoice",    accessor: "invoice" },
    { key: "customer", header: "Customer",   accessor: "customer" },
    { key: "amount",   header: "Amount",     accessor: "amount",
      render: (value) => <strong>₹{value}</strong> },
    { key: "type",     header: "Payment Type", accessor: "type",
      render: (value: string) => (
        <Badge color="blue" variant="soft" style={{ textTransform: "capitalize" }}>{value}</Badge>
      ),
    },
    { key: "payment",  header: "Status",    accessor: "payment",
      render: (value: PaymentStatus) => (
        <Badge color={getPaymentColor(value)} variant="soft" style={{ textTransform: "capitalize" }}>{value}</Badge>
      ),
    },
    { key: "dateTime", header: "Date & Time", accessor: "dateTime",
      render: (value) => (
        <span style={{ whiteSpace: "nowrap", fontSize: 13 }}>{formatDate(value)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (_, row) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="soft" radius="full">
              <MoreVertical size={16} />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item><Pencil size={14} /> Edit</DropdownMenu.Item>
            <DropdownMenu.Item><Eye size={14} /> View</DropdownMenu.Item>
            <DropdownMenu.Item
              color="red"
              onClick={() => dispatch(deleteSale(sales[row.id]._id))}
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
    <>
      <style>{`
        /* ===== SALES PAGE RESPONSIVE ===== */

        .sales-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 4px;
        }

        /* Scrollable table wrapper on mobile */
        .sales-table-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 12px;
        }

        /* Ensure table inside doesn't shrink below readable width */
        .sales-table-wrap > * {
          min-width: 520px;
        }

        @media (max-width: 767px) {
          .sales-summary-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          /* Make 3rd card full width on mobile for odd number */
          .sales-summary-grid > *:last-child:nth-child(odd) {
            grid-column: 1 / -1;
          }
          .sales-filter-bar {
            flex-wrap: wrap;
            gap: 8px !important;
          }
          .sales-filter-bar > *:first-child {
            flex: 1 1 100% !important;
          }
        }

        @media (max-width: 400px) {
          .sales-summary-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ================= SUMMARY ================= */}
        <div className="sales-summary-grid">
          <SummaryCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
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
            value={`₹${averageOrder.toLocaleString()}`}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon="📊"
          />
        </div>

        {/* ================= FILTER BAR ================= */}
        <Flex align="center" gap="3" className="sales-filter-bar">
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
                <DropdownMenu.Item key={item} onSelect={() => setPaymentFilter(item)}>
                  {item}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>

        {/* ================= TABLE (scrollable on mobile) ================= */}
        <div className="sales-table-wrap">
          <Table<SaleTransaction>
            data={filteredSales}
            columns={columns}
            emptyMessage="No sales found"
            hoverable
            striped
          />
        </div>

      </div>
    </>
  );
}