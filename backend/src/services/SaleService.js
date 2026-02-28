const Sale = require("../models/Sales/SaleSchema");
const Product = require("../models/Product/ProductSchema");
const Order = require("../models/Order/OrderSchema");
const Counter = require("../models/System/CounterSchema");
const Customer = require("../models/Customers/CustomerSchema");
const Stockmanagement = require("../models/Stockmanagement/StockmanagementSchema");

/* ================= INVOICE ================= */

async function generateInvoiceNumber() {
  const counterKey = "invoice_number";

  const latest = await Sale.findOne({ invoiceNumber: /^INV-\d+$/ })
    .sort({ invoiceNumber: -1 })
    .select("invoiceNumber")
    .lean();
  const latestSeq = latest
    ? Number(String(latest.invoiceNumber).replace("INV-", "")) || 0
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

  return `INV-${String(counter.seq).padStart(4, "0")}`;
}

/* ================= ORDER NUMBER ================= */

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

/* ================= UPDATE CUSTOMER STATS ================= */
// direction: "increment" when sale created, "decrement" when sale cancelled

async function updateCustomerStats(customerId, totalAmount, direction) {
  if (!customerId) return;

  const delta = direction === "increment" ? 1 : -1;

  await Customer.findByIdAndUpdate(customerId, {
    $inc: {
      totalPurchases: delta,
      totalSpent: delta * totalAmount,
    },
  });
}

/* ================= SYNC STOCKMANAGEMENT COLLECTION ================= */
// Finds the matching Stockmanagement record by SKU and adjusts it.
// action: "remove" when sale created, "add" when sale cancelled

async function syncStockmanagement(productDoc, quantity, action, invoiceNumber) {
  const stockItem = await Stockmanagement.findOne({ sku: productDoc.sku });

  if (!stockItem) {
    // Stock management record doesn't exist for this product — skip silently.
    // (Not every product needs to be in Stockmanagement)
    return;
  }

  if (action === "remove") {
    stockItem.currentStock = Math.max(0, stockItem.currentStock - quantity);
  } else {
    stockItem.currentStock += quantity;
  }

  // Recalculate status
  if (stockItem.currentStock === 0) {
    stockItem.status = "Out of Stock";
  } else if (stockItem.currentStock <= stockItem.minStockLevel) {
    stockItem.status = "Low Stock";
  } else {
    stockItem.status = "In Stock";
  }

  // Push to stock history for full traceability
  stockItem.stockHistory.push({
    action,
    quantity,
    reason: action === "remove" ? "sale" : "sale-cancelled",
    referenceNo: invoiceNumber,
    notes:
      action === "remove"
        ? `Auto-deducted from POS sale`
        : `Auto-restored — order cancelled`,
  });

  await stockItem.save();
}

/* ================= CREATE SALE (LEGACY DIRECT FLOW) ================= */

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
    const productDoc = await Product.findById(item.product);

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
      orderSource: orderType || "POS", // Map the orderType from the payload to orderSource
    });

    // ✅ Sync Stockmanagement
    if (productDoc) {
      await syncStockmanagement(productDoc, item.quantity, "remove", invoiceNumber);
    }

    createdSales.push(sale);
  }

  // ✅ Update customer stats
  if (customerId) {
    await updateCustomerStats(customerId, totalAmount, "increment");
  }

  return { order, sales: createdSales };
}

/* ================= ⭐ ATOMIC CREATE SALE FROM ORDER ================= */

async function createSaleFromOrder(order, paymentMethod = "Cash") {
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
    return [];
  }

  const customerId = await findOrCreateCustomer(
    lockedOrder.customerName,
    lockedOrder.phone
  );

  const invoiceNumber = await generateInvoiceNumber();

  // ✅ STEP 1: Validate ALL items before touching any stock
  for (const item of lockedOrder.items) {
    const productDoc = await Product.findById(item.product);
    if (!productDoc) throw new Error(`Product not found: ${item.name}`);

    const stockItem = await Stockmanagement.findOne({ sku: productDoc.sku });
    const available = stockItem ? stockItem.currentStock : productDoc.stockQty;

    if (available < item.quantity) {
      throw new Error(`Insufficient stock for: ${productDoc.name} (available: ${available}, needed: ${item.quantity})`);
    }
  }

  // ✅ STEP 2: Deduct stock, build items list for invoice
  let totalAmount = 0;
  let firstProductId = null;
  let totalQuantity = 0;
  const saleItems = [];

  for (const item of lockedOrder.items) {
    const productDoc = await Product.findById(item.product);
    if (!firstProductId) firstProductId = productDoc._id;

    productDoc.stockQty = Math.max(0, productDoc.stockQty - item.quantity);
    await productDoc.save();

    await syncStockmanagement(productDoc, item.quantity, "remove", invoiceNumber);

    saleItems.push({
      product: productDoc._id,
      name: item.name || productDoc.name,
      price: item.price,
      quantity: item.quantity,
    });

    totalAmount += item.price * item.quantity;
    totalQuantity += item.quantity;
  }

  const normalizePayment = (method) => {
    const valid = ["Cash", "Card", "UPI", "PhonePe", "GPay", "Paytm", "Other"];
    const match = valid.find(v => v.toLowerCase() === (method || "Cash").toLowerCase());
    return match || "Cash";
  };

  // ✅ ONE sale per order with ALL items stored — fixes invoice showing only first product
  const sale = await Sale.create({
    invoiceNumber,
    items: saleItems,
    product: firstProductId,
    quantity: totalQuantity,
    sellingPrice: totalAmount,
    totalAmount,
    customer: customerId,
    paymentMethod: normalizePayment(paymentMethod || lockedOrder.paymentMethod),
    paymentStatus: "Completed",
    orderSource: lockedOrder.orderSource || "POS",
  });

  if (customerId) {
    await updateCustomerStats(customerId, totalAmount, "increment");
  }

  return [sale];
}

/* ================= ⭐ REVERSE SALE ON CANCELLATION ================= */

async function reverseSaleFromOrder(order) {
  if (!order || !order.items?.length) return;

  // Only reverse if a sale was actually created
  if (!order.saleCreated) return;

  // Find all sales linked to this order's invoice number range
  // We match by product + customer + approximate time window
  // Best approach: store orderId on Sale (see note below)
  // For now we reverse stock and customer stats directly

  const customerId = order.customer ||
    (order.phone
      ? (await Customer.findOne({ phoneNumber: order.phone }))?._id
      : null);

  for (const item of order.items) {
    const productDoc = await Product.findById(item.product);

    if (!productDoc) continue;

    // ✅ Restore Product.stockQty
    productDoc.stockQty += item.quantity;
    await productDoc.save();

    // ✅ Restore Stockmanagement collection
    await syncStockmanagement(
      productDoc,
      item.quantity,
      "add",
      `CANCEL-${order.orderNumber}`
    );
  }

  // ✅ Reverse customer stats
  if (customerId) {
    await updateCustomerStats(customerId, order.totalAmount, "decrement");
  }

  // ✅ Mark related sales as Cancelled
  // We find sales by customer + products within a short time window
  // Ideal fix: add orderId field to Sale schema (recommended — see comments)
  const saleUpdatePromises = order.items.map((item) =>
    Sale.findOneAndUpdate(
      {
        product: item.product,
        customer: customerId,
        paymentStatus: { $ne: "Cancelled" },
      },
      { $set: { paymentStatus: "Cancelled" } },
      { sort: { createdAt: -1 } } // most recent first
    )
  );

  await Promise.all(saleUpdatePromises);
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

  if (filters.orderSource) {
    if (filters.orderSource === "POS") {
      // Because older POS orders might not have an orderSource field at all, 
      // we match records where orderSource is either "POS" or doesn't exist.
      query.$or = [
        { orderSource: "POS" },
        { orderSource: { $exists: false } }
      ];
    } else {
      query.orderSource = filters.orderSource;
    }
  }

  const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
  const limit = Number(filters.limit) > 0 ? Number(filters.limit) : 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Sale.find(query)
      .populate("product", "name sku")
      .populate("customer", "fullName phoneNumber")
      .populate("soldBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Sale.countDocuments(query),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/* ================= SUMMARY (AGGREGATED) ================= */

async function getSalesSummary() {
  const result = await Sale.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const summary = result[0] || { totalRevenue: 0, totalOrders: 0 };
  const averageOrder =
    summary.totalOrders > 0
      ? Math.round(summary.totalRevenue / summary.totalOrders)
      : 0;

  return {
    totalRevenue: summary.totalRevenue || 0,
    totalOrders: summary.totalOrders || 0,
    averageOrder,
  };
}

module.exports = {
  createSale,
  getAllSales,
  createSaleFromOrder,
  reverseSaleFromOrder,
  getSalesSummary,
};
