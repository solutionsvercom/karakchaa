const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, { _id: false });

const saleSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },

    items: [saleItemSchema],

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false,
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

    discount: {
        type: Number,
        default: 0,
        min: 0,
    },

    subtotal: {
        type: Number,
        default: 0,
        min: 0,
    },

    gstRate: {
        type: Number,
        default: 0,
        min: 0,
    },

    gstAmount: {
        type: Number,
        default: 0,
        min: 0,
    },

    taxableAmount: {
        type: Number,
        default: 0,
        min: 0,
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

    orderSource: {
        type: String,
        default: "POS",
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

module.exports = mongoose.models.Sale || mongoose.model("Sale", saleSchema);