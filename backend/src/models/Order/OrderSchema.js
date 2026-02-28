const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    items: [orderItemSchema],

    customerName: String,
    phone: String,
    tableNumber: String,

    orderType: {
      type: String,
      enum: ["dine-in", "takeaway", "delivery", "online"],
      default: "dine-in",
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Preparing", "Ready", "Completed", "Cancelled"],
      default: "Pending",
    },

    // ✅ NEW: Store payment method so it can be used when creating the Sale
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "PhonePe", "GPay", "Paytm", "Other"],
      default: "Cash",
    },

    totalAmount: Number,

    notes: String,

    /* ⭐ ATOMIC SALE LOCK — prevents duplicate invoices */
    saleCreated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);