require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
// import errorMiddleware from "./src/middlewares/errorMiddleware.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use(errorMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use("/api/products", require("./src/routes/Product"));
app.use("/api/sales", require("./src/routes/Sale"));


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
app.use('/api/test', require('./src/routes/test'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});