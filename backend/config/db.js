const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI?.trim();
  if (!uri) {
    throw new Error(
      "MONGO_URI is not set. Add it in Hostinger env vars or backend/.env"
    );
  }

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
  });
  isConnected = true;
  console.log("MongoDB Connected ✅");
};

const isDbReady = () =>
  isConnected && mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isDbReady = isDbReady;
