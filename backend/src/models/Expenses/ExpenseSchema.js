const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "misc",
        "rent",
        "salary",
        "utilities",
        "supplies",
        "inventory",
        "marketing",
        "maintenance",
        "transport",
        "taxes",
      ],
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["cash", "upi", "bank"],
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    vendor: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// optional: text search like your UI search (title/vendor/notes)
expenseSchema.index({ title: "text", vendor: "text", notes: "text" });
expenseSchema.index({ category: 1, date: -1 });


module.exports = mongoose.model("Expense", expenseSchema);
