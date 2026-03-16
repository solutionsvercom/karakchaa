const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "Karakchaa",
    },
    gstRate: {
      type: Number,
      default: 5,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", SettingsSchema);
