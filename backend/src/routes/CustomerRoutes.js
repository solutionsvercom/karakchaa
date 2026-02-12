const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');

// CREATE
router.post('/create', CustomerController.createCustomer);

// STATS (MUST BE FIRST)
router.get('/stats', CustomerController.getCustomerStats);

// READ
router.get('/all', CustomerController.getAllCustomers);
router.get('/:id', CustomerController.getCustomerById);

// UPDATE
router.put('/update/:id', CustomerController.updateCustomer);

// DELETE
router.delete('/delete/:id', CustomerController.deleteCustomer);

module.exports = router;