const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      match: [/^[0-9+\-\s]{10,15}$/, "Invalid phone number"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },

    gst: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
      match: [
        /^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GST number",
      ],
    },

    paymentTerms: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100, 
    },

    productsSupplied: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

supplierSchema.index({
  companyName: "text",
  contactPerson: "text",
  phone: "text",
  email: "text",
  productsSupplied: "text",
});
supplierSchema.index({ active: 1, createdAt: -1 });


module.exports = mongoose.model("Supplier", supplierSchema);
