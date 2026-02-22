const Order = require("../models/Order/OrderSchema");
const SaleService = require("./SaleService");

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
        notes,
    } = data;

    const orderNumber = await generateOrderNumber();

    const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const formattedItems = items.map(item => ({
        product: item.productId || item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
    }));

    const order = await Order.create({
        orderNumber,
        items: formattedItems,
        customerName: customerName || "Walk-in",
        phone,
        tableNumber,
        orderType: orderType || "online",
        totalAmount,
        notes,
    });

    /* ================= POS INSTANT SALE ================= */
    if (order.orderType !== "online") {
        await SaleService.createSaleFromOrder(order);
    }

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
    const allowedStatuses = [
        "Pending",
        "Accepted",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
        throw new Error("Invalid order status");
    }

    const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    ).populate("items.product");

    if (!order) {
        throw new Error("Order not found");
    }

    /* ================= DIGITAL MENU FLOW ================= */
    if (order.orderType === "online" && status === "Completed") {
        await SaleService.createSaleFromOrder(order);
    }

    return order;
}

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
};
