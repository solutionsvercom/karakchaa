require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const customerRoutes = require('./src/routes/CustomerRoutes');
const stockRoutes = require('./src/routes/StockmanagementRoutes');

app.use('/api/customers', customerRoutes);
app.use('/api/stock', stockRoutes);


// Database connection
connectDB();

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Backend server is running!' });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// Test routes for MongoDB
app.use('/api/test', require('./src/routes/Test'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});