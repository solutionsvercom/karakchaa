const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // ✅ 2MB max (reduced from 5MB)
    fileFilter: (req, file, cb) => {
        // ✅ Only allow image files
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"), false);
        }
    },
});

module.exports = upload;