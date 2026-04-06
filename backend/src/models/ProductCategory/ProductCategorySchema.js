const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productCategorySchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("ProductCategory", productCategorySchema);
