const Sale = require("../models/Sales/SaleSchema");
const Product = require("../models/Product/ProductSchema");
const Order = require("../models/Order/OrderSchema");
const Counter = require("../models/System/CounterSchema");
const Customer = require("../models/Customers/CustomerSchema");
const Stockmanagement = require("../models/Stockmanagement/StockmanagementSchema");
const mongoose = require("mongoose");

// Utility to sync Product.stockQty with Stockmanagement (read-only cache)
async function syncProductStock(productDoc) {
  const stockItem = await Stockmanagement.findOne({ sku: productDoc.sku });
  if (stockItem) {
    productDoc.stockQty = stockItem.currentStock;
    await productDoc.save();
  }
}

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


async function syncStockmanagement(productDoc, quantity, action, invoiceNumber) {
  const stockItem = await Stockmanagement.findOne({ sku: productDoc.sku });

  if (!stockItem) {
   
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
    discount = 0,
  } = data;

  if (!items || !items.length) {
    throw new Error("No items provided");
  }

  const customerId = await findOrCreateCustomer(customerName, phone);
  const orderNumber = await generateOrderNumber();

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const productDoc = await Product.findById(item.product);
      if (!productDoc) throw new Error("Product not found");

      if (productDoc.stockQty < item.quantity) {
        throw new Error("Insufficient stock");
      }

      productDoc.stockQty -= item.quantity;
      await productDoc.save({ session });

      // Sync Stockmanagement (new: ensure consistency)
      await syncStockmanagement(productDoc, item.quantity, "remove", "TEMP");  // Temp, will update with real invoice
      await syncProductStock(productDoc);  // Keep Product in sync

      totalAmount += productDoc.sellingPrice * item.quantity;

      orderItems.push({
        product: productDoc._id,
        name: productDoc.name,
        price: productDoc.sellingPrice,
        quantity: item.quantity,
      });
    }

    const discountedTotal = Math.max(totalAmount - discount, 0);

    const order = await Order.create({
      orderNumber,
      items: orderItems,
      customerName,
      phone,
      orderType,
      notes,
      discount,
      totalAmount: discountedTotal,
      status: "Pending",
      customer: customerId,
    }, { session });

    const invoiceNumber = await generateInvoiceNumber();

    const sale = await Sale.create([{
      invoiceNumber,
      items: orderItems.map(item => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      product: orderItems[0]?.product,
      quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      sellingPrice: discountedTotal,
      totalAmount: discountedTotal,
      discount,
      customer: customerId,
      paymentMethod,
      paymentStatus,
      soldBy,
      orderSource: orderType || "POS",
    }], { session });

    const createdSales = [sale[0]];

    if (customerId) {
      await updateCustomerStats(customerId, totalAmount, "increment");
    }

    await session.commitTransaction();
    return { order, sales: createdSales };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function createSaleFromOrder(order, paymentMethod = "Cash") {
  if (!order || !order.items?.length) {
    throw new Error("Invalid order for sale conversion");
  }

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

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const item of lockedOrder.items) {
      const productDoc = await Product.findById(item.product);
      if (!productDoc) throw new Error(`Product not found: ${item.name}`);

      const stockItem = await Stockmanagement.findOne({ sku: productDoc.sku });
      const available = stockItem ? stockItem.currentStock : productDoc.stockQty;

      if (available < item.quantity) {
        throw new Error(`Insufficient stock for: ${productDoc.name} (available: ${available}, needed: ${item.quantity})`);
      }
    }

    let totalAmount = 0;
    let firstProductId = null;
    let totalQuantity = 0;
    const saleItems = [];

    for (const item of lockedOrder.items) {
      const productDoc = await Product.findById(item.product);
      if (!firstProductId) firstProductId = productDoc._id;

      productDoc.stockQty = Math.max(0, productDoc.stockQty - item.quantity);
      await productDoc.save({ session });

      await syncStockmanagement(productDoc, item.quantity, "remove", invoiceNumber);

      await syncProductStock(productDoc);  // Ensure Product reflects Stockmanagement

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

    const discount = order.discount || 0;
    const discountedTotal = Math.max(totalAmount - discount, 0);

    const sale = await Sale.create([{
      invoiceNumber,
      items: saleItems,
      product: firstProductId,
      quantity: totalQuantity,
      sellingPrice: discountedTotal,
      totalAmount: discountedTotal,
      discount,
      customer: customerId,
      paymentMethod: normalizePayment(paymentMethod || lockedOrder.paymentMethod),
      paymentStatus: "Completed",
      orderSource: lockedOrder.orderSource || "POS",
    }], { session });

    const createdSale = sale[0];

    if (customerId) {
      await updateCustomerStats(customerId, totalAmount, "increment");
    }

    await session.commitTransaction();
    return [createdSale];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function reverseSaleFromOrder(order) {
  if (!order || !order.items?.length) return;

  if (!order.saleCreated) return;

  const customerId = order.customer ||
    (order.phone
      ? (await Customer.findOne({ phoneNumber: order.phone }))?._id
      : null);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const item of order.items) {
      const productDoc = await Product.findById(item.product);

      if (!productDoc) continue;

      productDoc.stockQty += item.quantity;
      await productDoc.save({ session });

      // Restore Stockmanagement collection
      await syncStockmanagement(
        productDoc,
        item.quantity,
        "add",
        `CANCEL-${order.orderNumber}`
      );

      await syncProductStock(productDoc);  // Sync back
    }

    // Reverse customer stats
    if (customerId) {
      await updateCustomerStats(customerId, order.totalAmount, "decrement");
    }

    const saleUpdatePromises = order.items.map((item) =>
      Sale.findOneAndUpdate(
        {
          product: item.product,
          customer: customerId,
          paymentStatus: { $ne: "Cancelled" },
        },
        { $set: { paymentStatus: "Cancelled" } },
        { sort: { createdAt: -1 }, session } // most recent first
      )
    );

    await Promise.all(saleUpdatePromises);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

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
