const Order = require("../models/Order/OrderSchema");
const SaleService = require("./SaleService");
const Counter = require("../models/System/CounterSchema");
const Settings = require("../models/Settings");
const { calculatePricing } = require("./PricingService");

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

  // Fetch global Settings
  let settings = await Settings.findOne();
  if (!settings) settings = { gstRate: 0, discountType: "percentage", discountValue: 0 };

  const gstRate = settings.gstRate || 0;
  let discount = 0;

  const subtotalRaw = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  if (settings.discountType === "percentage") {
    discount = (subtotalRaw * (settings.discountValue || 0)) / 100;
  } else {
    discount = settings.discountValue || 0;
  }

  const formattedItems = items.map((item) => ({
    product: item.productId || item.product,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const pricing = calculatePricing({
    items: formattedItems,
    discount,
    gstRate,
  });

  // Centralized orderSource assignment (single source of truth)
  const finalOrderType = orderType || "online";
  const orderSource = finalOrderType === "online" ? "DIGITAL" : "POS";

  const initialStatus = orderSource === "POS" ? "Completed" : "Pending";

  const order = await Order.create({
    orderNumber,
    items: formattedItems,
    customerName: customerName || "Walk-in",
    phone,
    tableNumber,
    orderType: finalOrderType,
    orderSource, 
    status: initialStatus, 
    paymentMethod: paymentMethod || "Cash",
    discount: pricing.discount,
    subtotal: pricing.subtotal,
    gstRate: pricing.gstRate,
    gstAmount: pricing.gstAmount,
    taxableAmount: pricing.taxableAmount,
    totalAmount: pricing.totalAmount,
    notes,
  });

  if (orderSource === "POS" && initialStatus === "Completed") {
    await SaleService.createSaleFromOrder(order, order.paymentMethod);
    order.saleCreated = true;
  }

  return order;
}

async function getOrders(options = {}) {
  const {
    page = 1,
    limit = 50, 
    status,
    orderSource,
    orderType,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const query = {};
  if (status) {
    // Check if status is a comma-separated list
    if (status.includes(",")) {
      query.status = { $in: status.split(",").map(s => s.trim()) };
    } else {
      query.status = status;
    }
  }
  if (orderSource) query.orderSource = orderSource;
  if (orderType) query.orderType = orderType;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("items.product", "name sku") 
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(), 
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

  if (order.orderSource === "DIGITAL" && status === "Completed") {
    await SaleService.createSaleFromOrder(order, order.paymentMethod);
  }

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
