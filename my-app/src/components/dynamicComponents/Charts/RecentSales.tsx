import React from "react";
import { Badge } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { Sale } from "../../../features/SalesSlice";

interface RecentSalesProps {
  sales: Sale[];
  limit?: number;
}

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed": return "green";
    case "pending":   return "yellow";
    case "cancelled": return "red";
    default:          return "gray";
  }
};

const getItemNames = (sale: Sale): string => {
  // Try items array first
  const items = (sale as any).items;
  if (Array.isArray(items) && items.length > 0) {
    return items.map((i: any) => i.name).join(", ");
  }
  // Fallback to single product
  return sale.product?.name || "—";
};

export const RecentSales: React.FC<RecentSalesProps> = ({ sales, limit = 5 }) => {
  const navigate = useNavigate();
  const recent = [...sales]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return (
    <div style={{
      background: "var(--gray-1)",
      borderRadius: 16,
      border: "1px solid var(--gray-4)",
      padding: "20px 20px 8px",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Recent Sales</span>
        <button
          onClick={() => navigate("/dashboard/sales")}
          style={{
            background: "var(--accent-9)",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          View All →
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", flex: 1 }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
          tableLayout: "fixed",
        }}>
          <colgroup>
            <col style={{ width: "18%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>

          <thead>
            <tr style={{ borderBottom: "1px solid var(--gray-4)" }}>
              {["INVOICE", "CUSTOMER", "ITEMS", "AMOUNT", "PAYMENT", "TIME"].map((h) => (
                <th key={h} style={{
                  padding: "8px 10px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: 11,
                  color: "var(--gray-10)",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {recent.map((sale, i) => {
              const itemNames = getItemNames(sale);
              const customer = sale.customer?.fullName || sale.customerName || "Walk-in";
              const status = sale.paymentStatus || "completed";

              return (
                <tr
                  key={sale._id ?? i}
                  style={{
                    borderBottom: "1px solid var(--gray-3)",
                    verticalAlign: "middle",
                  }}
                >
                  {/* Invoice */}
                  <td style={{ padding: "12px 10px", fontWeight: 600, whiteSpace: "nowrap" }}>
                    #{sale.invoiceNumber}
                  </td>

                  {/* Customer */}
                  <td style={{
                    padding: "12px 10px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "var(--gray-11)",
                  }}>
                    {customer}
                  </td>

                  {/* Items — truncated with tooltip */}
                  <td style={{ padding: "12px 10px" }}>
                    <span
                      title={itemNames}
                      style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--gray-11)",
                        maxWidth: "100%",
                      }}
                    >
                      {itemNames}
                    </span>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: "12px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>
                    ₹{sale.totalAmount}
                  </td>

                  {/* Payment status */}
                  <td style={{ padding: "12px 10px" }}>
                    <Badge
                      color={getStatusColor(status) as any}
                      variant="soft"
                      style={{ textTransform: "capitalize", fontSize: 11 }}
                    >
                      {status}
                    </Badge>
                  </td>

                  {/* Time */}
                  <td style={{
                    padding: "12px 10px",
                    color: "var(--gray-10)",
                    whiteSpace: "nowrap",
                    fontSize: 12,
                  }}>
                    {formatTime(sale.createdAt)}
                  </td>
                </tr>
              );
            })}

            {recent.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--gray-9)" }}>
                  No recent sales
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};