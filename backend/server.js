require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/products", require("./src/routes/Product"));
app.use("/api/sales", require("./src/routes/Sale"));

/* ================= ROUTES IMPORT ================= */
const authRoutes = require('./src/routes/AuthRoutes');
const customerRoutes = require('./src/routes/CustomerRoutes');
const stockRoutes = require('./src/routes/StockmanagementRoutes');
const employeeRoutes = require('./src/routes/EmployeesRoutes');
const expenseRoutes = require("./src/routes/ExpenseRoutes.js"); 
const supplierRoutes = require("./src/routes/SupplierRoutes.js");

// const productRoutes = require('./src/routes/ProductRoutes');
// const salesRoutes = require('./src/routes/SalesRoutes');
const roleRoutes = require("./src/routes/RoleRoutes");



/* ================= ROUTES USE ================= */
app.use('/api/auth', authRoutes);
app.use("/api/roles", roleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/employees', employeeRoutes);
app.use("/api/products", require("./src/routes/Product"));
app.use("/api/sales", require("./src/routes/Sale"));
app.use("/api/expenses", expenseRoutes);
app.use("/api/suppliers", supplierRoutes);

/* ================= BASIC ROUTES ================= */
app.get('/', (req, res) => {
    res.json({ message: 'Backend server is running!' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 5000;

const startServer = async() => {
    try {
        await connectDB(); // Wait for DB connection

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Failed to connect to database:', error.message);
        process.exit(1);
    }
};

startServer();