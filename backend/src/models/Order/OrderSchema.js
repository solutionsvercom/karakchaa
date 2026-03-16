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

    //  Explicit order source for clear differentiation
    orderSource: {
      type: String,
      enum: ["POS", "DIGITAL"],
      default: "POS", 
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

    totalAmount: Number,

    notes: String,

    saleCreated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Most common query: filter by status/orderType, sort by createdAt
orderSchema.index({ status: 1, orderType: 1, createdAt: -1 });

orderSchema.index({ orderSource: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
