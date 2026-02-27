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
  SalesPagination,
  fetchSalesSummary,
} from "../../features/SalesSlice";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/* ================= TYPES ================= */

type PaymentStatus = "pending" | "completed" | "cancelled";

type SaleTransaction = {
  id: number;
  invoice: string;
  customer: string;
  phone: string;
  items: string;
  saleItems: { name: string; price: number; quantity: number }[];
  type: string;
  orderSource?: string;
  amount: number;
  payment: PaymentStatus;
  dateTime: string;
};

/* ================= HELPERS ================= */

const getPaymentColor = (status: PaymentStatus) => {
  switch (status) {
    case "completed": return "green";
    case "pending": return "yellow";
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
  const { sales, loading, pagination, summary } = useSelector((state: RootState) => state.sales);

  const [searchValue, setSearchValue] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");
  const [orderTypeFilter, setOrderTypeFilter] = useState("All Orders");

  const [viewSale, setViewSale] = useState<SaleTransaction | null>(null);
  const [editSale, setEditSale] = useState<{ row: SaleTransaction; sale: Sale } | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchFilteredSales = (page = 1) => {
    let source: string | undefined = undefined;
    if (orderTypeFilter === "POS") source = "POS";
    if (orderTypeFilter === "Digital Menu") source = "DIGITAL";

    // TODO: payment filters / search strings could also be added to server-side logic in the future

    dispatch(fetchSales({
      page,
      limit: 10,
      orderSource: source,
    }));
  };

  useEffect(() => {
    fetchFilteredSales(1);
    dispatch(fetchSalesSummary());
  }, [dispatch, orderTypeFilter]);

  const mappedSales: SaleTransaction[] = sales.map((s: Sale, index) => ({
    id: index,
    invoice: s.invoiceNumber,
    customer: s.customer?.fullName || s.customerName || "Walk-in",
    phone: s.customer?.phoneNumber || "",
    items: s.product?.name || "-",
    saleItems: (s as any).items?.length
      ? (s as any).items
      : [{ name: s.product?.name || "-", price: s.sellingPrice || s.totalAmount, quantity: s.quantity || 1 }],
    type: s.paymentMethod,
    orderSource: (s as any).orderSource ||
      (["online", "digital_menu"].includes((s as any).orderType?.toLowerCase()) ? "DIGITAL" : "POS"),
    amount: s.totalAmount,
    payment: (s.paymentStatus?.toLowerCase() as PaymentStatus),
    dateTime: s.createdAt,
  }));

  const filteredSales = mappedSales.filter((sale) => {
    const matchesSearch =
      sale.invoice.toLowerCase().includes(searchValue.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchValue.toLowerCase());
    const matchesPayment =
      paymentFilter === "All Payments" ||
      sale.type.toLowerCase() === paymentFilter.toLowerCase();

    // NOTE: OrderSource matching is now handled mostly by the server,
    // but the local filter applies too for robustness (and search/payment).
    let matchesOrderType = true;
    if (orderTypeFilter === "POS") {
      matchesOrderType = !sale.orderSource || sale.orderSource.toUpperCase() !== "DIGITAL";
    } else if (orderTypeFilter === "Digital Menu") {
      matchesOrderType = sale.orderSource?.toUpperCase() === "DIGITAL";
    }

    return matchesSearch && matchesPayment && matchesOrderType;
  });

  const { totalRevenue, totalOrders, averageOrder } = summary || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrder: 0,
  };

  /* ================= TABLE COLUMNS ================= */

  const columns: Column<SaleTransaction>[] = [
    { key: "invoice", header: "Invoice", accessor: "invoice" },
    { key: "customer", header: "Customer", accessor: "customer" },
    {
      key: "amount", header: "Amount", accessor: "amount",
      render: (value) => <strong>₹{value}</strong>
    },
    {
      key: "type", header: "Payment Type", accessor: "type",
      render: (value: string) => (
        <Badge color="blue" variant="soft" style={{ textTransform: "capitalize" }}>{value}</Badge>
      ),
    },
    {
      key: "orderSource", header: "Order Source", accessor: "orderSource",
      render: (value: string) => (
        <Badge color={value === "DIGITAL" ? "violet" : "orange"} variant="soft">
          {value || "POS"}
        </Badge>
      ),
    },
    {
      key: "payment", header: "Status", accessor: "payment",
      render: (value: PaymentStatus) => (
        <Badge color={getPaymentColor(value)} variant="soft" style={{ textTransform: "capitalize" }}>{value}</Badge>
      ),
    },
    {
      key: "dateTime", header: "Date & Time", accessor: "dateTime",
      render: (value) => (
        <span style={{ whiteSpace: "nowrap", fontSize: 13 }}>{formatDate(value)}</span>
      ),
    },
    {
      key: "actions", header: "Actions",
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
            {/* <DropdownMenu.Item onClick={() => setEditSale({ row, sale: sales[row.id] })}>
              <Pencil size={14} /> Change Status
            </DropdownMenu.Item> */}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    },
  ];

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
                {orderTypeFilter}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {["All Orders", "POS", "Digital Menu"].map((item) => (
                <DropdownMenu.Item key={item} onSelect={() => setOrderTypeFilter(item)}>
                  {item}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

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
            loading={loading}
            enablePagination={false}
          />
        </div>

        {/* ================= SERVER PAGINATION ================= */}
        {pagination && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 4px",
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              color: "var(--gray-11)",
              fontSize: 13,
            }}
          >
            <div>
              Showing page {pagination.page} of {pagination.totalPages} · Total{" "}
              {pagination.total} sales
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() =>
                  pagination.page > 1 &&
                  fetchFilteredSales(pagination.page - 1)
                }
                disabled={pagination.page <= 1 || loading}
                style={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: 999,
                  border: "1px solid var(--gray-7)",
                  background: "var(--gray-1)",
                  color: "var(--gray-12)",
                  fontSize: 12,
                  cursor:
                    pagination.page <= 1 || loading ? "not-allowed" : "pointer",
                  opacity: pagination.page <= 1 || loading ? 0.5 : 1,
                }}
              >
                ‹
              </button>

              {Array.from({ length: pagination.totalPages }).map((_, i) => {
                const page = i + 1;

                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                ) {
                  const isActive = page === pagination.page;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => fetchFilteredSales(page)}
                      disabled={loading}
                      style={{
                        minWidth: 28,
                        height: 28,
                        borderRadius: 999,
                        border: isActive
                          ? "1px solid var(--accent-8)"
                          : "1px solid var(--gray-7)",
                        background: isActive
                          ? "var(--accent-3)"
                          : "var(--gray-1)",
                        color: isActive
                          ? "var(--accent-11)"
                          : "var(--gray-12)",
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 400,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {page}
                    </button>
                  );
                }

                if (
                  page === pagination.page - 2 ||
                  page === pagination.page + 2
                ) {
                  return (
                    <span key={page} style={{ padding: "0 4px" }}>
                      …
                    </span>
                  );
                }

                return null;
              })}

              <button
                type="button"
                onClick={() =>
                  pagination.page < pagination.totalPages &&
                  fetchFilteredSales(pagination.page + 1)
                }
                disabled={
                  pagination.page >= pagination.totalPages || loading
                }
                style={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: 999,
                  border: "1px solid var(--gray-7)",
                  background: "var(--gray-1)",
                  color: "var(--gray-12)",
                  fontSize: 12,
                  cursor:
                    pagination.page >= pagination.totalPages || loading
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    pagination.page >= pagination.totalPages || loading
                      ? 0.5
                      : 1,
                }}
              >
                ›
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ===== VIEW INVOICE MODAL ===== */}
      <Dialog.Root open={!!viewSale} onOpenChange={() => setViewSale(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000 }} />
          <Dialog.Content style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "Canvas", color: "CanvasText",
            padding: "24px 24px 20px",
            width: "min(460px, calc(100vw - 32px))",
            borderRadius: 16, zIndex: 1001,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}>
            <Dialog.Title asChild>
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>Sale Details</div>
                    <div style={{ fontSize: 13, color: "var(--gray-10)", marginTop: 2 }}>
                      #{viewSale?.invoice}
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--gray-10)", padding: 4, borderRadius: 6,
                      display: "flex", alignItems: "center",
                    }}>
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                </div>
              </div>
            </Dialog.Title>
            <Dialog.Description asChild>
              <span style={{ display: "none" }}>Sale invoice details</span>
            </Dialog.Description>

            {viewSale && (
              <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 16 }}>

                {/* ── Info Grid ── */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "12px 0",
                  padding: "16px 0",
                  borderTop: "1px solid var(--gray-a4)",
                  borderBottom: "1px solid var(--gray-a4)",
                  marginBottom: 16,
                }}>
                  <InfoCell label="Customer" value={viewSale.customer} />
                  <InfoCell label="Phone" value={viewSale.phone || "—"} />
                  <InfoCell label="Payment Method" value={viewSale.type} />
                  <InfoCell label="Status" value={viewSale.payment} statusColor={
                    viewSale.payment === "completed" ? "var(--green-9)" :
                      viewSale.payment === "cancelled" ? "var(--red-9)" : "var(--yellow-9)"
                  } />
                </div>

                {/* ── Items ── */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Items</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {viewSale.saleItems.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Totals ── */}
                <div style={{
                  borderTop: "1px solid var(--gray-a4)",
                  paddingTop: 12,
                  display: "flex", flexDirection: "column", gap: 6,
                  marginBottom: 20,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--gray-11)" }}>Subtotal</span>
                    <span>₹{viewSale.amount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--gray-11)" }}>Discount</span>
                    <span>-₹0</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                    <span>Total</span>
                    <span style={{ color: "var(--accent-9)" }}>₹{viewSale.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* ── Action Button ── */}
                {viewSale.payment === "cancelled" ? (
                  <button
                    disabled={editLoading}
                    onClick={async () => {
                      const sale = sales.find(s => s.invoiceNumber === viewSale.invoice);
                      if (!sale) return;
                      setEditLoading(true);
                      try {
                        await dispatch(updateSale({
                          id: sale._id,
                          data: { paymentStatus: "Completed" },
                        })).unwrap();
                        dispatch(fetchSales());
                        setViewSale(null);
                      } finally {
                        setEditLoading(false);
                      }
                    }}
                    style={{
                      width: "100%", padding: "13px 0", borderRadius: 10,
                      background: "var(--green-9)", color: "white",
                      border: "none", cursor: editLoading ? "not-allowed" : "pointer",
                      opacity: editLoading ? 0.7 : 1,
                      fontSize: 15, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    ✓ Mark as Completed
                  </button>
                ) : (
                  <button
                    disabled={editLoading}
                    onClick={async () => {
                      const sale = sales.find(s => s.invoiceNumber === viewSale.invoice);
                      if (!sale) return;
                      setEditLoading(true);
                      try {
                        await dispatch(updateSale({
                          id: sale._id,
                          data: { paymentStatus: "Cancelled" },
                        })).unwrap();
                        dispatch(fetchSales());
                        setViewSale(null);
                      } finally {
                        setEditLoading(false);
                      }
                    }}
                    style={{
                      width: "100%", padding: "13px 0", borderRadius: 10,
                      background: "var(--red-9)", color: "white",
                      border: "none", cursor: editLoading ? "not-allowed" : "pointer",
                      opacity: editLoading ? 0.7 : 1,
                      fontSize: 15, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    ⊗ Cancel Sale
                  </button>
                )}
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
function InfoCell({ label, value, statusColor }: { label: string; value: string; statusColor?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 12, color: "var(--gray-10)" }}>{label}</span>
      <span style={{
        fontSize: 14, fontWeight: 600,
        color: statusColor || "CanvasText",
        textTransform: statusColor ? "capitalize" : undefined,
      }}>{value}</span>
    </div>
  );
}