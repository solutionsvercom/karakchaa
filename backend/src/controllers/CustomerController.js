const Customer = require('../models/Customers/CustomerSchema');

exports.createCustomer = async(req, res) => {
    try {
        const { fullName, phoneNumber, address, notes } = req.body;

        if (!fullName || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Full Name and Phone Number are required'
            });
        }

        const existingCustomer = await Customer.findOne({
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim()
        });

        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: 'Customer already exists with this name and phone number'
            });
        }

        const customer = new Customer({
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
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

exports.getAllCustomers = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const customers = await Customer.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Customer.countDocuments();

        res.json({
            success: true,
            message: 'Customers fetched successfully',
            count: customers.length,
            data: customers,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load customers',
            error: error.message
        });
    }
};

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

exports.updateCustomer = async(req, res) => {
    try {
        const { fullName, phoneNumber } = req.body;

        if (fullName && phoneNumber) {
            const existingCustomer = await Customer.findOne({
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                _id: { $ne: req.params.id } 
            });

            if (existingCustomer) {
                return res.status(409).json({
                    success: false,
                    message: 'Customer already exists with this name and phone number'
                });
            }
        }

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