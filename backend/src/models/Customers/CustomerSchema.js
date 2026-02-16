const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true // ✅ Automatically trim whitespace
    },

    phoneNumber: {
        type: String,
        required: true,
        trim: true // ✅ Automatically trim whitespace
    },

    email: {
        type: String,
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

// ✅ COMPOUND INDEX - Prevents duplicate name+phone at database level
customerSchema.index({ fullName: 1, phoneNumber: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);