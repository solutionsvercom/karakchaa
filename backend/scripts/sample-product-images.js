require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Product = require("../src/models/Product/ProductSchema");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const samples = await Product.find({ "image.url": { $exists: true, $ne: "" } })
    .limit(8)
    .select("name image.url");
  for (const p of samples) {
    console.log(p.name, "->", (p.image?.url || "").substring(0, 100));
  }
  const total = await Product.countDocuments({ "image.url": { $exists: true, $ne: "" } });
  console.log("total_with_image_url", total);
  await mongoose.disconnect();
})();
