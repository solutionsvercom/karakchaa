const Order = require("../models/Order/OrderSchema");

async function generateOrderNumber() {
    const count = await Order.countDocuments();
    return `ORD-${String(count + 1).padStart(5, "0")}`;
}

/* CREATE ORDER */
async function createOrder(data) {
    const {
        items,
        customerName,
        phone,
        tableNumber,
        orderType,
    } = data;

    const orderNumber = await generateOrderNumber();

    const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const order = await Order.create({
        orderNumber,
        items,
        customerName,
        phone,
        tableNumber,
        orderType,
        totalAmount,
    });

    return order;
}

/* GET ALL ORDERS */
async function getOrders() {
    return await Order.find()
        .populate("items.product", "name sku")
        .sort({ createdAt: -1 });
}

/* UPDATE STATUS */
async function updateOrderStatus(id, status) {
    return await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );
}

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
};
