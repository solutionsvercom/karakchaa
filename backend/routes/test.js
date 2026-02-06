const express = require('express');
const router = express.Router();
const Test = require('../models/test');

// Create a test document (this will create the collection)
router.post('/create', async (req, res) => {
  try {
    const testDoc = new Test({
      name: req.body.name || 'Test Document',
      message: req.body.message || 'MongoDB connection test successful!'
    });
    
    const savedDoc = await testDoc.save();
    res.status(201).json({
      success: true,
      message: 'Test document created successfully!',
      data: savedDoc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating test document',
      error: error.message
    });
  }
});

// Get all test documents
router.get('/all', async (req, res) => {
  try {
    const tests = await Test.find();
    res.json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test documents',
      error: error.message
    });
  }
});

module.exports = router;