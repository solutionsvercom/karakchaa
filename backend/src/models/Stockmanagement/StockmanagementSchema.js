const mongoose = require('mongoose');

const stockmanagementSchema = new mongoose.Schema({


    productName: {
        type: String,
        required: true
    },

    sku: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    currentStock: {
        type: Number,
        default: 0
    },

    minStockLevel: {
        type: Number,
        default: 0
    },

    unit: {
        type: String,
        default: 'piece'
    },


    status: {
        type: String,
        enum: ['In Stock', 'Low Stock', 'Out of Stock'],
        default: 'In Stock'
    },


    stockHistory: [{
        action: {
            type: String,
            enum: ['add', 'remove'],
            required: true
        },

        quantity: {
            type: Number,
            required: true
        },

        reason: {
            type: String,
            required: true
        },

        referenceNo: {
            type: String
        },

        notes: {
            type: String
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    'Stockmanagement',
    stockmanagementSchema
);