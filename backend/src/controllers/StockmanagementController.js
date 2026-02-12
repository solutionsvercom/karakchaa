const mongoose = require('mongoose');
const Stockmanagement = require('../models/Stockmanagement/StockmanagementSchema');

/* =========================
   CREATE PRODUCT
========================= */
exports.createStockItem = async(req, res) => {
    try {
        const { productName, sku, category, currentStock, minStockLevel, unit } = req.body;

        if (!productName || !sku || !category) {
            return res.status(400).json({
                success: false,
                message: 'Product Name, SKU and Category are required'
            });
        }

        const stockItem = new Stockmanagement({
            productName,
            sku,
            category,
            currentStock: currentStock || 0,
            minStockLevel: minStockLevel || 0,
            unit: unit || 'piece'
        });

        const savedItem = await stockItem.save();

        res.status(201).json({
            success: true,
            message: 'Product added to stock successfully',
            data: savedItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to create stock item',
            error: error.message
        });
    }
};

/* =========================
   GET ALL STOCK ITEMS
========================= */
exports.getAllStock = async(req, res) => {
    try {
        const items = await Stockmanagement.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock items',
            error: error.message
        });
    }
};

/* =========================
   GET SINGLE STOCK BY ID
========================= */
exports.getStockById = async(req, res) => {
    try {
        const id = req.params.id.trim();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid stock ID'
            });
        }

        const stockItem = await Stockmanagement.findById(id);

        if (!stockItem) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: stockItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock item',
            error: error.message
        });
    }
};

/* =========================
   ADD STOCK
========================= */
exports.addStock = async(req, res) => {
    try {
        const { quantity, reason, referenceNo, notes } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid stock ID' });
        }

        const stockItem = await Stockmanagement.findById(id);

        if (!stockItem) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
        }

        stockItem.currentStock += quantity;

        stockItem.status =
            stockItem.currentStock === 0 ?
            'Out of Stock' :
            stockItem.currentStock <= stockItem.minStockLevel ?
            'Low Stock' :
            'In Stock';

        stockItem.stockHistory.push({
            action: 'add',
            quantity,
            reason,
            referenceNo,
            notes
        });

        await stockItem.save();

        res.json({
            success: true,
            message: 'Stock added successfully',
            data: stockItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add stock',
            error: error.message
        });
    }
};

/* =========================
   REMOVE STOCK
========================= */
exports.removeStock = async(req, res) => {
    try {
        const { quantity, reason, referenceNo, notes } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid stock ID' });
        }

        const stockItem = await Stockmanagement.findById(id);

        if (!stockItem) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
        }

        if (quantity > stockItem.currentStock) {
            return res.status(400).json({ success: false, message: 'Not enough stock available' });
        }

        stockItem.currentStock -= quantity;

        stockItem.status =
            stockItem.currentStock === 0 ?
            'Out of Stock' :
            stockItem.currentStock <= stockItem.minStockLevel ?
            'Low Stock' :
            'In Stock';

        stockItem.stockHistory.push({
            action: 'remove',
            quantity,
            reason,
            referenceNo,
            notes
        });

        await stockItem.save();

        res.json({
            success: true,
            message: 'Stock removed successfully',
            data: stockItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove stock',
            error: error.message
        });
    }
};

/* =========================
   STOCK HISTORY
========================= */
exports.getStockHistory = async(req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid stock ID' });
        }

        const stockItem = await Stockmanagement.findById(id);

        if (!stockItem) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({
            success: true,
            data: stockItem.stockHistory.reverse()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load stock history',
            error: error.message
        });
    }
};

/* =========================
   STOCK DASHBOARD STATS
========================= */
exports.getStockStats = async(req, res) => {
    try {
        const totalProducts = await Stockmanagement.countDocuments();
        const inStock = await Stockmanagement.countDocuments({ status: 'In Stock' });
        const lowStock = await Stockmanagement.countDocuments({ status: 'Low Stock' });
        const outOfStock = await Stockmanagement.countDocuments({ status: 'Out of Stock' });

        res.json({
            success: true,
            totalProducts,
            inStock,
            lowStock,
            outOfStock
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stock statistics',
            error: error.message
        });
    }
};