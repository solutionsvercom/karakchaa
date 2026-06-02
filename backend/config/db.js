const mongoose = require("mongoose");

let isConnected = false;
let lastMongoError = null;

const PLACEHOLDER_RE = /<[^>]+>|YOUR_|PASSWORD@|CHANGE_ME/i;

const validateMongoUri = (uri) => {
  if (PLACEHOLDER_RE.test(uri)) {
    throw new Error(
      "MONGO_URI still contains a placeholder (e.g. <db_password>). Replace it with your real Atlas password."
    );
  }
  if (!/mongodb(\+srv)?:\/\//i.test(uri)) {
    throw new Error("MONGO_URI must start with mongodb:// or mongodb+srv://");
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI?.trim();
  if (!uri) {
    throw new Error(
      "MONGO_URI is not set. Add it in Hostinger env vars or backend/.env"
    );
  }

  validateMongoUri(uri);

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    lastMongoError = null;
    return;
  }

  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
    });
    isConnected = true;
    lastMongoError = null;
    console.log("MongoDB Connected ✅");
  } catch (err) {
    isConnected = false;
    lastMongoError = err.message;
    throw err;
  }
};

const isDbReady = () =>
  isConnected && mongoose.connection.readyState === 1;

const getLastMongoError = () => lastMongoError;

module.exports = connectDB;
module.exports.isDbReady = isDbReady;
module.exports.getLastMongoError = getLastMongoError;
