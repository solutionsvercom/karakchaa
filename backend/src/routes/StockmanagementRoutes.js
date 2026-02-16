const express = require('express');
const router = express.Router();

const StockController = require('../controllers/StockmanagementController');

// CREATE
router.post('/create', StockController.createStockItem);

// READ
router.get('/all', StockController.getAllStock);
router.get('/stats', StockController.getStockStats);
router.get('/:id', StockController.getStockById);

// UPDATE STOCK
router.post('/add/:id', StockController.addStock);
router.post('/remove/:id', StockController.removeStock);

// HISTORY
router.get('/history/:id', StockController.getStockHistory);

module.exports = router;