const mongoose = require("mongoose");
const Product = require("../models/Product/ProductSchema");
const Stockmanagement = require("../models/Stockmanagement/StockmanagementSchema");

async function syncProductStock(productDoc, session) {
  const stockItem = await Stockmanagement.findOne({ sku: productDoc.sku }).session(
    session || null
  );
  if (stockItem) {
    productDoc.stockQty = stockItem.currentStock;
    await productDoc.save({ session: session || undefined });
  }
}

async function syncStockmanagement(productDoc, quantity, action, referenceNo, session) {
  const query = Stockmanagement.findOne({ sku: productDoc.sku });
  const stockItem = session ? await query.session(session) : await query;

  if (!stockItem) {
    return;
  }

  if (action === "remove") {
    stockItem.currentStock = Math.max(0, stockItem.currentStock - quantity);
  } else {
    stockItem.currentStock += quantity;
  }

  if (stockItem.currentStock === 0) {
    stockItem.status = "Out of Stock";
  } else if (stockItem.currentStock <= stockItem.minStockLevel) {
    stockItem.status = "Low Stock";
  } else {
    stockItem.status = "In Stock";
  }

  stockItem.stockHistory.push({
    action,
    quantity,
    reason:
      action === "remove" ? "digital order reserved" : "digital order released",
    referenceNo,
    notes:
      action === "remove"
        ? "Stock reserved for digital menu order"
        : "Stock released — digital order cancelled",
  });

  await stockItem.save({ session: session || undefined });
}

/**
 * Reserve stock when a digital menu order is placed (atomic per line item).
 */
async function reserveStockForOrderItems(items, orderNumber) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of items) {
      const productId = item.productId || item.product;
      const qty = Number(item.quantity) || 0;
      if (!productId || qty <= 0) {
        throw new Error("Invalid order item");
      }

      const productDoc = await Product.findOneAndUpdate(
        { _id: productId, stockQty: { $gte: qty } },
        { $inc: { stockQty: -qty } },
        { new: true, session }
      );

      if (!productDoc) {
        const existing = await Product.findById(productId).session(session);
        const name = item.name || existing?.name || "product";
        throw new Error(`Insufficient stock for ${name}`);
      }

      await syncStockmanagement(productDoc, qty, "remove", orderNumber, session);
      await syncProductStock(productDoc, session);
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Release reserved stock when a digital order is cancelled before completion.
 */
async function releaseStockForOrderItems(items, orderNumber) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of items) {
      const productId = item.product;
      const qty = Number(item.quantity) || 0;
      if (!productId || qty <= 0) continue;

      const productDoc = await Product.findById(productId).session(session);
      if (!productDoc) continue;

      productDoc.stockQty += qty;
      await productDoc.save({ session });

      await syncStockmanagement(productDoc, qty, "add", `CANCEL-${orderNumber}`, session);
      await syncProductStock(productDoc, session);
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = {
  reserveStockForOrderItems,
  releaseStockForOrderItems,
};
