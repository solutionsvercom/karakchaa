import React, { useEffect, useState } from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import {
  Button,
  Flex,
  Badge,
  DropdownMenu,
  IconButton,
} from "@radix-ui/themes";
import { ChevronDown, MoreVertical, Pencil, Eye } from "lucide-react";
import Table, { Column } from "../../components/dynamicComponents/Table";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/Store";
import {
  fetchSales,
  updateSale,
  Sale,
} from "../../features/SalesSlice";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/* ================= TYPES ================= */

type PaymentStatus = "pending" | "completed" | "cancelled";

type SaleTransaction = {
  id: number;
  invoice: string;
  customer: string;
  items: string;
  saleItems: { name: string; price: number; quantity: number }[]; // ✅ all items for invoice
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

  const [viewSale, setViewSale] = useState<SaleTransaction | null>(null);
  const [editSale, setEditSale] = useState<{ row: SaleTransaction; sale: Sale } | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  const mappedSales: SaleTransaction[] = sales.map((s: Sale, index) => ({
    id: index,
    invoice: s.invoiceNumber,
    customer: s.customer?.fullName || s.customerName || "Walk-in",
    items: s.product?.name || "-",
    // ✅ Use stored items array; fallback to single product for old records
    saleItems: (s as any).items?.length
      ? (s as any).items
      : [{ name: s.product?.name || "-", price: s.sellingPrice || s.totalAmount, quantity: s.quantity || 1 }],
    type: s.paymentMethod,
    amount: s.totalAmount,
    payment: (s.paymentStatus?.toLowerCase() as PaymentStatus), // ✅ FIXED: Normalize to lowercase
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
            <DropdownMenu.Item onClick={() => setViewSale(row)}>
              <Eye size={14} /> View Invoice
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => setEditSale({ row, sale: sales[row.id] })}>
              <Pencil size={14} /> Change Status
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
        .sales-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 4px;
        }
        .sales-table-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 12px;
        }
        .sales-table-wrap > * {
          min-width: 520px;
        }
        @media (max-width: 767px) {
          .sales-summary-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
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
              {["All Payments", "Cash", "Card", "UPI", "PhonePe", "GPay", "Paytm", "Other"].map((item) => (
                <DropdownMenu.Item key={item} onSelect={() => setPaymentFilter(item)}>
                  {item}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>

        {/* ================= TABLE ================= */}
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

      {/* ===== VIEW INVOICE MODAL ===== */}
      <Dialog.Root open={!!viewSale} onOpenChange={() => setViewSale(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000 }} />
          <Dialog.Content style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "Canvas", color: "CanvasText",
            padding: 28, width: "min(480px, calc(100vw - 32px))",
            borderRadius: 16, zIndex: 1001,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}>
            <Dialog.Title asChild>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>🧾 Invoice</span>
                <Dialog.Close asChild>
                  <Button variant="ghost" style={{ cursor: "pointer" }}><X size={20} /></Button>
                </Dialog.Close>
              </div>
            </Dialog.Title>
            <Dialog.Description asChild>
              <span style={{ display: "none" }}>Invoice details</span>
            </Dialog.Description>

            {viewSale && (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <div style={{ background: "var(--accent-9)", color: "white", padding: "16px 20px", borderRadius: "10px 10px 0 0" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>{viewSale.invoice}</div>
                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{formatDate(viewSale.dateTime)}</div>
                </div>

                <div style={{ border: "1px solid var(--gray-a4)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "20px" }}>
                  <Row label="Customer" value={viewSale.customer} />

                  {/* ✅ All ordered items */}
                  <div style={{ padding: "8px 0", borderBottom: "1px solid var(--gray-a3)" }}>
                    <span style={{ fontSize: 13, color: "var(--gray-11)" }}>Items Ordered</span>
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      {viewSale.saleItems.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                          <span>{item.name} × {item.quantity}</span>
                          <span style={{ fontWeight: 500 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Row label="Payment Type" value={viewSale.type} badge="blue" />
                  <Row label="Status" value={viewSale.payment} badge={
                    viewSale.payment === "completed" ? "green" :
                    viewSale.payment === "cancelled" ? "red" : "yellow"
                  } />
                  <div style={{ borderTop: "2px solid var(--gray-a4)", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>Total Amount</span>
                    <span style={{ fontWeight: 800, fontSize: 22, color: "var(--green-9)" }}>₹{viewSale.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ===== EDIT STATUS MODAL ===== */}
      <Dialog.Root open={!!editSale} onOpenChange={() => setEditSale(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000 }} />
          <Dialog.Content style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "Canvas", color: "CanvasText",
            padding: 28, width: "min(400px, calc(100vw - 32px))",
            borderRadius: 16, zIndex: 1001,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}>
            <Dialog.Title asChild>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>Change Status</span>
                <Dialog.Close asChild>
                  <Button variant="ghost" style={{ cursor: "pointer" }}><X size={20} /></Button>
                </Dialog.Close>
              </div>
            </Dialog.Title>
            <Dialog.Description asChild>
              <span style={{ display: "none" }}>Change sale payment status</span>
            </Dialog.Description>

            {editSale && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontSize: 14, color: "var(--gray-11)" }}>
                  Invoice: <strong>{editSale.row.invoice}</strong> · Current:{" "}
                  <Badge color={editSale.row.payment === "completed" ? "green" : editSale.row.payment === "cancelled" ? "red" : "yellow"} variant="soft" style={{ textTransform: "capitalize" }}>
                    {editSale.row.payment}
                  </Badge>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  {(["completed", "cancelled"] as const)
                    .filter(s => s !== editSale.row.payment)
                    .map(status => (
                      <Button
                        key={status}
                        disabled={editLoading}
                        style={{
                          flex: 1, height: 42, cursor: "pointer",
                          background: status === "completed" ? "var(--green-9)" : "var(--red-9)",
                          color: "white",
                        }}
                        onClick={async () => {
                          setEditLoading(true);
                          try {
                            await dispatch(updateSale({
                              id: editSale.sale._id,
                              data: { paymentStatus: status.charAt(0).toUpperCase() + status.slice(1) },
                            })).unwrap();
                            dispatch(fetchSales());
                            setEditSale(null);
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setEditLoading(false);
                          }
                        }}
                      >
                        Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </>
  );
}

/* ===== HELPER COMPONENT ===== */
function Row({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--gray-a3)" }}>
      <span style={{ fontSize: 13, color: "var(--gray-11)" }}>{label}</span>
      {badge ? (
        <Badge color={badge as any} variant="soft" style={{ textTransform: "capitalize" }}>{value}</Badge>
      ) : (
        <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
      )}
    </div>
  );
}