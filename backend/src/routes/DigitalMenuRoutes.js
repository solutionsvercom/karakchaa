const express = require("express");

const router = express.Router();

const {
    getDigitalMenuProducts,
} = require("../controllers/DigitalMenuController");


router.get("/products", getDigitalMenuProducts);

module.exports = router;