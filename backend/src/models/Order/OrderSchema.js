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

    // ✅ NEW: Explicit order source for clear differentiation
    orderSource: {
      type: String,
      enum: ["POS", "DIGITAL"],
      default: "POS", // Backward compatible - existing orders without this field get POS
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Preparing", "Ready", "Completed", "Cancelled"],
      default: "Pending",
    },

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

// ✅ STAFF-LEVEL: Compound index for pagination queries
// Most common query: filter by status/orderType, sort by createdAt
orderSchema.index({ status: 1, orderType: 1, createdAt: -1 });

// ✅ STAFF-LEVEL: Index for orderSource filtering
orderSchema.index({ orderSource: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
