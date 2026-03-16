require("dotenv").config();
const connectDB = require("./config/db");

//SCHEDULER IMPORT (new)
const {
  registerCustomerSalesBackup,
} = require("./src/scheduler/CustomerSalesBackupScheduler");
const express = require('express');
const cors = require('cors');
// const connectDB = require('./config/db');

const app = express();

/*MIDDLEWARE*/
console.log(process.env.CLOUDINARY_CLOUD_NAME);


app.use(cors());
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
app.use("/api/sales", saleRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/digital-menu", digitalMenuRoutes);
app.use("/api/digital-menu", digitalOrderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", require("./src/routes/ReportsRoutes"));
app.use("/api/settings", settingsRoutes);




/* BASIC ROUTES */
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

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