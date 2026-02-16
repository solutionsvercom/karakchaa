const Stockmanagement = require('../models/Stockmanagement/StockmanagementSchema');

/* =========================
   CREATE STOCK ITEM
========================= */
exports.createStockItem = async(stockData) => {
    return await Stockmanagement.create(stockData);
};

/* =========================
   GET ALL STOCK ITEMS
========================= */
exports.getAllStockItems = async() => {
    return await Stockmanagement.find().sort({ createdAt: -1 });
};

/* =========================
   GET STOCK ITEM BY ID
========================= */
exports.getStockItemById = async(stockId) => {
    return await Stockmanagement.findById(stockId);
};

/* =========================
   ADD STOCK
========================= */
exports.addStock = async(stockId, stockData) => {
    const { quantity, reason, referenceNo, notes } = stockData;

    const stockItem = await Stockmanagement.findById(stockId);
    if (!stockItem) return null;

    stockItem.currentStock += quantity;

    // Update status
    if (stockItem.currentStock === 0) {
        stockItem.status = 'Out of Stock';
    } else if (stockItem.currentStock <= stockItem.minStockLevel) {
        stockItem.status = 'Low Stock';
    } else {
        stockItem.status = 'In Stock';
    }

    stockItem.stockHistory.push({
        action: 'add',
        quantity,
        reason,
        referenceNo,
        notes
    });

    return await stockItem.save();
};

/* =========================
   REMOVE STOCK
========================= */
exports.removeStock = async(stockId, stockData) => {
    const { quantity, reason, referenceNo, notes } = stockData;

    const stockItem = await Stockmanagement.findById(stockId);
    if (!stockItem) return null;

    if (quantity > stockItem.currentStock) {
        throw new Error('INSUFFICIENT_STOCK');
    }

    stockItem.currentStock -= quantity;

    // Update status
    if (stockItem.currentStock === 0) {
        stockItem.status = 'Out of Stock';
    } else if (stockItem.currentStock <= stockItem.minStockLevel) {
        stockItem.status = 'Low Stock';
    } else {
        stockItem.status = 'In Stock';
    }

    stockItem.stockHistory.push({
        action: 'remove',
        quantity,
        reason,
        referenceNo,
        notes
    });

    return await stockItem.save();
};

/* =========================
   GET STOCK HISTORY
========================= */
exports.getStockHistory = async(stockId) => {
    const stockItem = await Stockmanagement.findById(stockId);
    if (!stockItem) return null;

    return stockItem.stockHistory.reverse();
};