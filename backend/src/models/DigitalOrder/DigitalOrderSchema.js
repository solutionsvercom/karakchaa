const mongoose = require("mongoose");

const DigitalOrderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    name: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
}, { _id: false });

const DigitalOrderSchema = new mongoose.Schema({
    items: {
        type: [DigitalOrderItemSchema],
        required: true,
    },

    customerName: {
        type: String,
        default: "Guest",
    },

    phone: {
        type: String,
        default: "",
    },

    tableNumber: {
        type: String,
        default: "",
    },

    orderType: {
        type: String,
        enum: ["dine-in", "takeaway"],
        default: "dine-in",
    },

    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "served",
            "cancelled",
        ],
        default: "pending",
    },

    totalAmount: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("DigitalOrder", DigitalOrderSchema);