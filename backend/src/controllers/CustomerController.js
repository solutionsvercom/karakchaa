const Customer = require('../models/Customers/CustomerSchema');

/* =========================
   CREATE CUSTOMER
   (Add New Customer)
========================= */
exports.createCustomer = async(req, res) => {
    try {
        const { fullName, phoneNumber, email, address, notes } = req.body;

        if (!fullName || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Full Name and Phone Number are required'
            });
        }

        const customer = new Customer({
            fullName,
            phoneNumber,
            email,
            address,
            notes
        });

        const savedCustomer = await customer.save();

        res.status(201).json({
            success: true,
            message: 'Customer added successfully',
            data: savedCustomer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to add customer. Please try again.',
            error: error.message
        });
    }
};

/* =========================
   GET ALL CUSTOMERS
   (Customer Table List)
========================= */
exports.getAllCustomers = async(req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            message: 'Customers fetched successfully',
            count: customers.length,
            data: customers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load customers',
            error: error.message
        });
    }
};

/* =========================
   GET SINGLE CUSTOMER
   (Edit Customer Modal)
========================= */
exports.getCustomerById = async(req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            message: 'Customer details loaded',
            data: customer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customer details',
            error: error.message
        });
    }
};

/* =========================
   UPDATE CUSTOMER
   (Edit Customer)
========================= */
exports.updateCustomer = async(req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: updatedCustomer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update customer',
            error: error.message
        });
    }
};

/* =========================
   DELETE CUSTOMER
   (Optional / Action Menu)
========================= */
exports.deleteCustomer = async(req, res) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);

        if (!deletedCustomer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to delete customer',
            error: error.message
        });
    }
};

/* =========================
   CUSTOMER DASHBOARD STATS
   (Top Cards)
========================= */
exports.getCustomerStats = async(req, res) => {
    try {
        const stats = await Customer.aggregate([{
            $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                totalPurchases: { $sum: '$totalPurchases' },
                totalRevenue: { $sum: '$totalSpent' }
            }
        }]);

        res.json({
            success: true,
            message: 'Customer statistics loaded',
            data: stats[0] || {
                totalCustomers: 0,
                totalPurchases: 0,
                totalRevenue: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load customer statistics',
            error: error.message
        });
    }
};