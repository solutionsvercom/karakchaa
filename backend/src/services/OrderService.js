const Order = require("../models/Order/OrderSchema");
const SaleService = require("./SaleService");
const Counter = require("../models/System/CounterSchema");

async function generateOrderNumber() {
  const counterKey = "order_number";

  const latest = await Order.findOne({ orderNumber: /^ORD-\d+$/ })
    .sort({ orderNumber: -1 })
    .select("orderNumber")
    .lean();
  const latestSeq = latest
    ? Number(String(latest.orderNumber).replace("ORD-", "")) || 0
    : 0;

  await Counter.updateOne(
    { key: counterKey },
    { $max: { seq: latestSeq } },
    { upsert: true }
  );

  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();

  return `ORD-${String(counter.seq).padStart(5, "0")}`;
}

/* ================= CREATE ORDER ================= */

async function createOrder(data) {
  const {
    items,
    customerName,
    phone,
    tableNumber,
    orderType,
    paymentMethod,
    notes,
  } = data;

  const orderNumber = await generateOrderNumber();

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formattedItems = items.map((item) => ({
    product: item.productId || item.product,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  // ✅ STAFF-LEVEL: Centralized orderSource assignment (single source of truth)
  const finalOrderType = orderType || "online";
  const orderSource = finalOrderType === "online" ? "DIGITAL" : "POS";

  // ✅ BUG FIX: POS orders should be "Completed" by default, not "Pending"
  // Digital Menu orders start as "Pending" and progress through workflow
  const initialStatus = orderSource === "POS" ? "Completed" : "Pending";

  const order = await Order.create({
    orderNumber,
    items: formattedItems,
    customerName: customerName || "Walk-in",
    phone,
    tableNumber,
    orderType: finalOrderType,
    orderSource, // ✅ NEW: Explicit source
    status: initialStatus, // ✅ BUG FIX: POS = Completed, Digital = Pending
    paymentMethod: paymentMethod || "Cash",
    totalAmount,
    notes,
  });

  /* ================= POS INSTANT SALE ================= */
  // POS orders (dine-in, takeaway, delivery) → sale created immediately
  // Digital Menu orders → sale created when status reaches "Completed"
  if (orderSource === "POS") {
    await SaleService.createSaleFromOrder(order, paymentMethod);
  }

  return order;
}

/* ================= GET ALL ORDERS (WITH PAGINATION) ================= */

async function getOrders(options = {}) {
  const {
    page = 1,
    limit = 50, // Staff-level default: reasonable page size
    status,
    orderSource,
    orderType,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  // ✅ STAFF-LEVEL: Build query dynamically
  const query = {};
  if (status) query.status = status;
  if (orderSource) query.orderSource = orderSource;
  if (orderType) query.orderType = orderType;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // ✅ PERFORMANCE: Use lean() for read-only operations + limit populate fields
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("items.product", "name sku") // Only fetch needed fields
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(), // ✅ Faster - returns plain JS objects
    Order.countDocuments(query),
  ]);

  return {
    data: orders,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasMore: skip + orders.length < total,
    },
  };
}

/* ================= UPDATE ORDER STATUS ================= */

async function updateOrderStatus(id, status, paymentMethod) {
  const allowedStatuses = [
    "Pending",
    "Accepted",
    "Preparing",
    "Ready",
    "Completed",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid order status");
  }

  const orderBefore = await Order.findById(id);
  if (!orderBefore) throw new Error("Order not found");

  // ✅ DEFENSIVE: Prevent POS orders from being set to "Pending"
  if (orderBefore.orderSource === "POS" && status === "Pending") {
    throw new Error("POS orders cannot be moved to Pending status");
  }

  const updateData = { status };
  
  if (paymentMethod) {
    updateData.paymentMethod = paymentMethod;
  }

  const order = await Order.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).populate("items.product");

  if (!order) throw new Error("Order not found");

  /* ================= DIGITAL MENU: create sale when Completed ================= */
  if (order.orderSource === "DIGITAL" && status === "Completed") {
    await SaleService.createSaleFromOrder(order, order.paymentMethod);
  }

  /* ================= ANY ORDER TYPE: reverse sale when Cancelled ================= */
  if (status === "Cancelled") {
    await SaleService.reverseSaleFromOrder(orderBefore);
  }

  return order;
}

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
};
