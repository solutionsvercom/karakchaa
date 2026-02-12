const Sale = require("../models/Sale");
const Product = require("../models/Product");

/**
 * Generate Invoice Number
 * Example: INV-0001
 */
async function generateInvoiceNumber() {
  const count = await Sale.countDocuments();
  return `INV-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Create Sale (POS)
 */
async function createSale(data) {
  const {
    product,
    quantity,
    sellingPrice,
    customer,
    paymentMethod,
    paymentStatus,
    soldBy,
  } = data;

  // 1️⃣ Check product
  const productDoc = await Product.findById(product);
  if (!productDoc) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  // 2️⃣ Check stock
  if (productDoc.stockQty < quantity) {
    const err = new Error("Insufficient stock");
    err.statusCode = 400;
    throw err;
  }

  // 3️⃣ Deduct stock
  productDoc.stockQty -= quantity;
  await productDoc.save();

  // 4️⃣ Calculate total
  const totalAmount = quantity * sellingPrice;

  // 5️⃣ Generate invoice
  const invoiceNumber = await generateInvoiceNumber();

  // 6️⃣ Create sale
  const sale = await Sale.create({
    invoiceNumber,
    product,
    quantity,
    sellingPrice,
    totalAmount,
    customer,
    paymentMethod,
    paymentStatus,
    soldBy,
  });

  return sale;
}

/**
 * Get all sales with filters
 */
async function getAllSales(filters = {}) {
  const query = {};

  // 📅 Date filter
  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) {
      query.createdAt.$gte = new Date(filters.from);
    }
    if (filters.to) {
      query.createdAt.$lte = new Date(filters.to);
    }
  }

  // 📦 Product filter
  if (filters.product) {
    query.product = filters.product;
  }

  return await Sale.find(query)
    .populate("product", "name sku")
    .populate("customer", "name")
    .populate("soldBy", "name")
    .sort({ createdAt: -1 });
}

module.exports = {
  createSale,
  getAllSales,
};
