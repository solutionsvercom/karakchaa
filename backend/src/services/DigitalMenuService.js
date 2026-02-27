const Product = require("../models/Product/ProductSchema");

exports.getAllDigitalMenuProducts = async () => {

    const products = await Product.find({ isActive: true })
        .select("_id name sellingPrice category image stockQty isActive isVeg")
        .sort({ category: 1, name: 1 });

    const formattedProducts = products.map(product => ({
        _id: product._id,
        name: product.name,
        price: product.sellingPrice,
        category: product.category,
        image: product.image ? product.image.url : "",
        stockQty: product.stockQty,
        isAvailable: product.stockQty > 0,
        isVeg: product.isVeg !== undefined ? product.isVeg : true, // ✅ FIXED
    }));

    return formattedProducts;

};


/* ================= GET PRODUCT BY ID ================= */

exports.getDigitalMenuProductById = async (productId) => {

    const product = await Product.findById(productId);

    if (!product)
        throw new Error("Product not found");

    return {
        _id: product._id,
        name: product.name,
        price: product.sellingPrice,
        category: product.category,
        image: product.image ? product.image.url : "",
        stockQty: product.stockQty,
        isAvailable: product.stockQty > 0,
        isVeg: product.isVeg !== undefined ? product.isVeg : true, // ✅ FIXED
    };

};