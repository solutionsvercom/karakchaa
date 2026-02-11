require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const customerRoutes = require('./src/routes/CustomerRoutes');
const stockRoutes = require('./src/routes/StockmanagementRoutes');

app.use('/api/customers', customerRoutes);
app.use('/api/stock', stockRoutes);



const customerRoutes = require('./src/routes/CustomerRoutes');
const stockRoutes = require('./src/routes/StockmanagementRoutes');

app.use('/api/customers', customerRoutes);
app.use('/api/stock', stockRoutes);


/* ================= DATABASE ================= */
connectDB();

/* ================= ROUTES ================= */

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Backend server is running!' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// ✅ EMPLOYEES ROUTES (KEEP THIS)
app.use('/api/employees', require('./src/routes/EmployeesRoutes'));

// ❌ REPORTS DISABLED FOR NOW
// app.use('/api/reports', require('./src/routes/ReportsRoutes'));

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
