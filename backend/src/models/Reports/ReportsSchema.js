import mongoose from "mongoose";

const ReportsSchema = new mongoose.Schema(
  {
    period: {
      type: String,
      enum: [
        "All Time",
        "Today",
        "Yesterday",
        "Last 7 Days",
        "Last 14 Days",
        "Last 30 Days",
        "Last 3 Months",
        "Last 6 Months",
        "Last 1 Year",
      ],
      required: true,
    },

    /* ===== SALES SUMMARY ===== */
    totalRevenue: {
      type: Number,
      required: true,
      default: 0,
    },

    totalOrders: {
      type: Number,
      required: true,
      default: 0,
    },

    /* ===== EXPENSE SUMMARY ===== */
    totalExpenses: {
      type: Number,
      required: true,
      default: 0,
    },

    netProfit: {
      type: Number,
      required: true,
      default: 0,
    },

    /* ===== EXPENSE BREAKDOWN ===== */
    expenseBreakdown: {
      inventory: { type: Number, default: 0 },
      supplies: { type: Number, default: 0 },
      salary: { type: Number, default: 0 },
      utilities: { type: Number, default: 0 },
      rent: { type: Number, default: 0 },
      maintenance: { type: Number, default: 0 },
      others: { type: Number, default: 0 },
    },

    /* ===== CHART DATA ===== */
    revenueTrend: [
      {
        label: String, // e.g. Jan, Feb, Week 1
        revenue: Number,
      },
    ],

    topProducts: [
      {
        productName: String,
        quantity: Number,
        revenue: Number,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Report", ReportsSchema);
