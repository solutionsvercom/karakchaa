const mongoose = require("mongoose");

const EmployeesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
    },

    role: {
      type: String,
      enum: ["staff", "manager", "owner", "cashier", "chef", "delivery"],
      required: true,
    },

    salary: {
      type: Number,
      required: true,
    },

    joinDate: {
      type: Date,
    },

    address: {
      type: String,
    },

    emergencyContact: {
      type: String,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Employee", EmployeesSchema);
