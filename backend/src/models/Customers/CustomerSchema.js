const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({


    fullName: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    email: {
        type: String
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

module.exports = mongoose.model('Customer', customerSchema);