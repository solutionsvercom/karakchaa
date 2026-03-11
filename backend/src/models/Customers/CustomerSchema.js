const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true 
    },

    phoneNumber: {
        type: String,
        required: true,
        trim: true 
    },

    address: {
        type: String
    },

    notes: {
        type: String
    },

    totalPurchases: {
        type: Number,
        default: 0
    },

    totalSpent: {
        type: Number,
        default: 0
    },

    points: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

customerSchema.index({ fullName: 1, phoneNumber: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);