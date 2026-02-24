const express = require("express");
const router = express.Router();

const cloudinary = require("../../config/cloudinary");
const upload = require("../middleware/upload");

router.post("/", upload.single("image"), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`, { folder: "restaurant/test" }
        );

        res.json({
            message: "Upload successful",
            imageUrl: result.secure_url,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;