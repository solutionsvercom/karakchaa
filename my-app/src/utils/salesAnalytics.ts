import { Sale } from "../features/SalesSlice";

export type AnalyticsSale = {
  id: number;
  invoice: string;
  customer: string;
  items: string;
  product?: Sale["product"];
  quantity?: number;
  saleItems: Sale["items"];
  type: string;
  amount: number;
  payment: string;
  dateTime: string;
};

export const isCancelledSale = (sale: Sale) =>
  String(sale.paymentStatus || "").toLowerCase() === "cancelled";

export const getReportableSales = (sales: Sale[]) =>
  sales.filter((sale) => !isCancelledSale(sale));

export const mapSalesToAnalytics = (sales: Sale[]): AnalyticsSale[] =>
  sales.map((sale, index) => ({
    id: index,
    invoice: sale.invoiceNumber,
    customer: sale.customer?.fullName || sale.customerName || "Walk-in",
    items: sale.product?.name || "-",
    product: sale.product,
    quantity: sale.quantity,
    saleItems: sale.items || [],
    type: sale.paymentMethod,
    amount: sale.totalAmount,
    payment: sale.paymentStatus,
    dateTime: sale.createdAt,
  }));

export const calculateSalesTotals = (sales: Pick<Sale, "totalAmount">[]) => {
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalOrders = sales.length;
  const averageOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return {
    totalRevenue,
    totalOrders,
    averageOrder,
  };
};

export const getLastNDaysSales = (sales: Sale[], days: number): Sale[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= cutoffDate;
  });
};

export const getTodaysSales = (sales: Sale[]): Sale[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === today.getTime();
  });
};
