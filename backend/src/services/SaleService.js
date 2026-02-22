const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Order = require("../models/Order/OrderSchema");
const Customer = require("../models/Customers/CustomerSchema");

/* ================= INVOICE ================= */

async function generateInvoiceNumber() {
  const count = await Sale.countDocuments();
  return `INV-${String(count + 1).padStart(4, "0")}`;
}

/* ================= ORDER NUMBER ================= */

async function generateOrderNumber() {
  const count = await Order.countDocuments();
  return `ORD-${String(count + 1).padStart(5, "0")}`;
}

/* ================= FIND OR CREATE CUSTOMER ================= */

async function findOrCreateCustomer(fullName, phoneNumber) {
  if (!phoneNumber) return null;

  let customer = await Customer.findOne({ phoneNumber });

  if (!customer) {
    customer = await Customer.create({
      fullName: fullName || "Walk-in",
      phoneNumber,
    });
  }

  return customer._id;
}

/* ================= CREATE SALE (LEGACY FLOW - UNCHANGED) ================= */

async function createSale(data) {
  const {
    items,
    customerName,
    phone,
    paymentMethod,
    paymentStatus,
    orderType,
    notes,
    soldBy,
  } = data;

  if (!items || !items.length) {
    throw new Error("No items provided");
  }

  const customerId = await findOrCreateCustomer(customerName, phone);
  const orderNumber = await generateOrderNumber();

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const productDoc = await Product.findById(item.product);
    if (!productDoc) throw new Error("Product not found");

    if (productDoc.stockQty < item.quantity) {
      throw new Error("Insufficient stock");
    }

    productDoc.stockQty -= item.quantity;
    await productDoc.save();

    totalAmount += productDoc.sellingPrice * item.quantity;

    orderItems.push({
      product: productDoc._id,
      name: productDoc.name,
      price: productDoc.sellingPrice,
      quantity: item.quantity,
    });
  }

  const order = await Order.create({
    orderNumber,
    items: orderItems,
    customerName,
    phone,
    orderType,
    notes,
    totalAmount,
    status: "Pending",
    customer: customerId,
  });

  const invoiceNumber = await generateInvoiceNumber();
  const createdSales = [];

  for (const item of orderItems) {
    const sale = await Sale.create({
      invoiceNumber,
      product: item.product,
      quantity: item.quantity,
      sellingPrice: item.price,
      totalAmount: item.price * item.quantity,
      customer: customerId,
      paymentMethod,
      paymentStatus,
      soldBy,
    });

    createdSales.push(sale);
  }

  return { order, sales: createdSales };
}

/* ================= ⭐ ATOMIC CREATE SALE FROM ORDER ================= */

async function createSaleFromOrder(order) {
  if (!order || !order.items?.length) {
    throw new Error("Invalid order for sale conversion");
  }

  /* 🚨 ATOMIC LOCK — prevents duplicate sale creation */
  const lockedOrder = await Order.findOneAndUpdate(
    { _id: order._id, saleCreated: false },
    { $set: { saleCreated: true } },
    { new: true }
  );

  if (!lockedOrder) {
    // Sale already created safely
    return [];
  }

  const customerId = await findOrCreateCustomer(
    lockedOrder.customerName,
    lockedOrder.phone
  );

  const invoiceNumber = await generateInvoiceNumber();
  const createdSales = [];

  for (const item of lockedOrder.items) {
    const productDoc = await Product.findById(item.product);

    if (!productDoc) throw new Error("Product not found");

    if (productDoc.stockQty < item.quantity) {
      throw new Error("Insufficient stock");
    }

    /* ⭐ STOCK DEDUCTION */
    productDoc.stockQty -= item.quantity;
    await productDoc.save();

    const sale = await Sale.create({
      invoiceNumber,
      product: productDoc._id,
      quantity: item.quantity,
      sellingPrice: item.price,
      totalAmount: item.price * item.quantity,
      customer: customerId,
      paymentMethod: "Cash",
      paymentStatus: "Completed",
    });

    createdSales.push(sale);
  }

  return createdSales;
}

/* ================= GET SALES ================= */

async function getAllSales(filters = {}) {
  const query = {};

  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) query.createdAt.$gte = new Date(filters.from);
    if (filters.to) query.createdAt.$lte = new Date(filters.to);
  }

  if (filters.product) {
    query.product = filters.product;
  }

  return await Sale.find(query)
    .populate("product", "name sku")
    .populate("customer", "fullName")
    .populate("soldBy", "name")
    .sort({ createdAt: -1 });
}

module.exports = {
  createSale,
  getAllSales,
  createSaleFromOrder,
};