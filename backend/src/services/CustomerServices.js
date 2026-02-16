const Customer = require('../models/Customers/CustomerSchema');

/* =========================
   CREATE CUSTOMER
========================= */
exports.createCustomer = async(customerData) => {
    return await Customer.create(customerData);
};

/* =========================
   GET ALL CUSTOMERS
========================= */
exports.getAllCustomers = async() => {
    return await Customer.find().sort({ createdAt: -1 });
};

/* =========================
   GET CUSTOMER BY ID
========================= */
exports.getCustomerById = async(customerId) => {
    return await Customer.findById(customerId);
};

/* =========================
   UPDATE CUSTOMER
========================= */
exports.updateCustomer = async(customerId, updateData) => {
    return await Customer.findByIdAndUpdate(
        customerId,
        updateData, { new: true }
    );
};

/* =========================
   DELETE CUSTOMER
========================= */
exports.deleteCustomer = async(customerId) => {
    return await Customer.findByIdAndDelete(customerId);
};

/* =========================
   CUSTOMER DASHBOARD STATS
========================= */
exports.getCustomerStats = async() => {
    const stats = await Customer.aggregate([{
        $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            totalPurchases: { $sum: '$totalPurchases' },
            totalRevenue: { $sum: '$totalSpent' }
        }
    }]);

    return stats[0] || {
        totalCustomers: 0,
        totalPurchases: 0,
        totalRevenue: 0
    };
};