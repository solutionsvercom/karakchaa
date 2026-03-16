const DigitalOrder = require("../models/DigitalOrder/DigitalOrderSchema");
const Product = require("../models/Product/ProductSchema");
const Stockmanagement = require("../models/Stockmanagement/StockmanagementSchema");
const Settings = require("../models/Settings");
const { calculatePricing } = require("./PricingService");

async function syncStockmanagement(productDoc, quantity, action, referenceNo) {
  const stockItem = await Stockmanagement.findOne({ sku: productDoc.sku });
  if (!stockItem) return;

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
    reason: action === "remove" ? "digital order" : "digital order cancelled",
    referenceNo,
  });

  await stockItem.save();
}

exports.createDigitalOrderService = async(orderData) => {

    const {
        items,
        customerName,
        phone,
        tableNumber,
        orderType,
    } = orderData;

    if (!items || items.length === 0)
        throw new Error("Order items required");

    let settings = await Settings.findOne();
    if (!settings) settings = { gstRate: 0, discountType: "percentage", discountValue: 0 };

    const subtotalRaw = items.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
    );

    let discount = 0;
    if (settings.discountType === "percentage") {
        discount = (subtotalRaw * (settings.discountValue || 0)) / 100;
    } else {
        discount = settings.discountValue || 0;
    }

    const pricing = calculatePricing({
        items: items.map(i => ({ price: i.price, quantity: i.quantity })),
        discount,
        gstRate: settings.gstRate || 0,
    });

    // Validate stock and sync inventory
    for (const item of items) {
        const product = await Product.findById(item.productId || item.product);
        if (!product) {
            throw new Error("Product not found");
        }

        if (product.stockQty < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
        }

        product.stockQty = Math.max(0, product.stockQty - item.quantity);
        await product.save();

        await syncStockmanagement(product, item.quantity, "remove", "DIGITAL_ORDER");
    }

    const newOrder = new DigitalOrder({

        items,
        customerName,
        phone,
        tableNumber,
        orderType,
        totalAmount: pricing.totalAmount,

    });

    await newOrder.save();

    return newOrder;

};


exports.getDigitalOrderStatusService = async(orderId) => {

    const order = await DigitalOrder.findById(orderId);

    if (!order)
        throw new Error("Order not found");

    return order;

};


exports.getAllDigitalOrdersService = async() => {

    const orders = await DigitalOrder.find()
        .sort({ createdAt: -1 });

    return orders;

};
exports.updateDigitalOrderStatusService = async(orderId, newStatus) => {
    const validStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "served",
        "cancelled",
    ];

    if (!validStatuses.includes(newStatus)) {
        throw new Error("Invalid status");
    }

    const order = await DigitalOrder.findByIdAndUpdate(
        orderId, { status: newStatus }, { new: true }
    );

    if (!order) throw new Error("Order not found");

    return order;
};