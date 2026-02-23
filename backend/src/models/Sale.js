const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
    },

    sellingPrice: {
        type: Number,
        required: true,
    },

    totalAmount: {
        type: Number,
        required: true,
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
    },

    paymentMethod: {
        type: String,
        enum: ["Cash", "Card", "UPI", "PhonePe", "GPay", "Paytm", "Other"],
        required: true,
        default: "Cash",
    },

    paymentStatus: {
        type: String,
        enum: ["Completed", "Pending", "Cancelled"],
        default: "Completed",
    },

    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
    },

    soldAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model("Sale", saleSchema);