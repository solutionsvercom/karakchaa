const Order = require("../models/Order/OrderSchema");
const SaleService = require("./SaleService");

async function generateOrderNumber() {
  const count = await Order.countDocuments();
  return `ORD-${String(count + 1).padStart(5, "0")}`;
}

/* ================= CREATE ORDER ================= */

async function createOrder(data) {
  const {
    items,
    customerName,
    phone,
    tableNumber,
    orderType,
    paymentMethod, // ✅ NEW: received from CheckoutDialog
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

  const order = await Order.create({
    orderNumber,
    items: formattedItems,
    customerName: customerName || "Walk-in",
    phone,
    tableNumber,
    orderType: orderType || "online",
    paymentMethod: paymentMethod || "Cash", // ✅ stored on order
    totalAmount,
    notes,
  });

  /* ================= POS INSTANT SALE ================= */
  // dine-in, takeaway, delivery → sale created immediately at checkout
  // online (digital menu) → sale created only when status reaches "Completed"
  if (order.orderType !== "online") {
    await SaleService.createSaleFromOrder(order, paymentMethod);
  }

  return order;
}

/* ================= GET ALL ORDERS ================= */

async function getOrders() {
  return await Order.find()
    .populate("items.product", "name sku")
    .sort({ createdAt: -1 });
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

  // Fetch the FULL order before updating so we have items + saleCreated flag
  const orderBefore = await Order.findById(id);
  if (!orderBefore) throw new Error("Order not found");

  // ✅ Build update object
  const updateData = { status };
  
  // ✅ If paymentMethod is provided (e.g., when completing order), update it
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
  if (order.orderType === "online" && status === "Completed") {
    await SaleService.createSaleFromOrder(order, order.paymentMethod);
  }

  /* ================= ANY ORDER TYPE: reverse sale when Cancelled ================= */
  if (status === "Cancelled") {
    // reverseSaleFromOrder checks internally if saleCreated is true
    // so it's safe to always call it
    await SaleService.reverseSaleFromOrder(orderBefore);
  }

  return order;
}

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
};