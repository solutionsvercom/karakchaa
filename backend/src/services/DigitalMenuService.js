const Product = require("../models/Product/ProductSchema");
const { resolveProductImageUrlAsync } = require("../utils/imageUrl");

exports.getAllDigitalMenuProducts = async () => {
  const products = await Product.find({ isActive: true })
    .select("_id name sellingPrice category image stockQty isActive isVeg")
    .sort({ category: 1, name: 1 });

  const formattedProducts = await Promise.all(
    products.map(async (product) => ({
      _id: product._id,
      name: product.name,
      price: product.sellingPrice,
      category: product.category,
      image: await resolveProductImageUrlAsync(product.image),
      stockQty: product.stockQty,
      isAvailable: product.stockQty > 0,
      isVeg: product.isVeg !== undefined ? product.isVeg : true,
    }))
  );

  return formattedProducts;
};

exports.getDigitalMenuProductById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) throw new Error("Product not found");

  return {
    _id: product._id,
    name: product.name,
    price: product.sellingPrice,
    category: product.category,
    image: await resolveProductImageUrlAsync(product.image),
    stockQty: product.stockQty,
    isAvailable: product.stockQty > 0,
    isVeg: product.isVeg !== undefined ? product.isVeg : true,
  };
};
