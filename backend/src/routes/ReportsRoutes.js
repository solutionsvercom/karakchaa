const express = require('express');
const { getReports } = require('../controllers/ReportsController');

const router = express.Router();

router.get('/', getReports);

module.exports = router;
