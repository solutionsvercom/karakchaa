const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim());
if (missingEnv.length) {
  console.error(
    "❌ Missing or empty in backend/.env:",
    missingEnv.join(", ")
  );
  console.error(
    "   Copy backend/.env.example → backend/.env and add your MongoDB + Cloudinary values."
  );
  process.exit(1);
}

const connectDB = require("./config/db");

//SCHEDULER IMPORT (new)
const {
  registerCustomerSalesBackup,
} = require("./src/scheduler/CustomerSalesBackupScheduler");
const express = require("express");
const cors = require("cors");
const serveFrontends = require("./src/serveFrontends");

const app = express();

/* MIDDLEWARE */
app.set("trust proxy", 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (!allowedOrigins.length) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  if (/^https:\/\/(www\.)?karakcha\.in$/i.test(origin)) {
    return callback(null, true);
  }
  callback(null, false);
};

app.use(
  cors({
    origin: allowedOrigins.length ? corsOrigin : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ROUTES IMPORT */
const authRoutes = require("./src/routes/AuthRoutes");
const roleRoutes = require("./src/routes/RoleRoutes");
const customerRoutes = require("./src/routes/CustomerRoutes");
const stockRoutes = require("./src/routes/StockmanagementRoutes");
const employeeRoutes = require("./src/routes/EmployeesRoutes");
const expenseRoutes = require("./src/routes/ExpenseRoutes.js");
const supplierRoutes = require("./src/routes/SupplierRoutes.js");
const orderRoutes = require("./src/routes/OrderRoutes");
const productRoutes = require("./src/routes/Product");
const productCategoryRoutes = require("./src/routes/ProductCategoryRoutes");
const saleRoutes = require("./src/routes/Sale");

/* ROUTES USE */
app.use("/api/auth", authRoutes);
const digitalMenuRoutes = require("./src/routes/DigitalMenuRoutes");
const digitalOrderRoutes = require("./src/routes/DigitalOrderRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");


/* ROUTES USE */
app.use("/api/test-upload", require("./src/routes/testUpload"));
app.use('/api/auth', authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/digital-menu", digitalMenuRoutes);
app.use("/api/digital-menu", digitalOrderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", require("./src/routes/ReportsRoutes"));
app.use("/api/settings", settingsRoutes);




app.get("/api/health", async (req, res) => {
  let cloudinaryStatus = "unknown";
  try {
    const cloudinary = require("./config/cloudinary");
    await cloudinary.api.ping();
    cloudinaryStatus = "ok";
  } catch (err) {
    cloudinaryStatus = err.message || "error";
  }

  res.status(200).json({
    status: "OK",
    message: "Server is healthy",
    appUrl: process.env.APP_URL || null,
    cloudinary: cloudinaryStatus,
    timestamp: new Date().toISOString(),
  });
});

/* PRODUCTION: Digital menu (/) + Admin (/admin) */
serveFrontends(app);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* SERVER START */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB(); 

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);

      // START SCHEDULER AFTER SERVER & DB ARE READY
      registerCustomerSalesBackup();
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1);
  }
};

startServer();