const DigitalOrder = require("../models/DigitalOrder/DigitalOrderSchema");

exports.createDigitalOrderService = async(orderData) => {

    const {
        items,
        customerName,
        phone,
        tableNumber,
        orderType,
    } = orderData;

    if (!items || items.length === 0)
        throw new Error("Order items required");

    const totalAmount = items.reduce(
        (sum, item) =>
        sum + item.price * item.quantity,
        0
    );


    const newOrder = new DigitalOrder({

        items,
        customerName,
        phone,
        tableNumber,
        orderType,
        totalAmount,

    });

    await newOrder.save();

    return newOrder;

};


exports.getDigitalOrderStatusService = async(orderId) => {

    const order = await DigitalOrder.findById(orderId);

    if (!order)
        throw new Error("Order not found");

    return order;

};


exports.getAllDigitalOrdersService = async() => {

    const orders = await DigitalOrder.find()
        .sort({ createdAt: -1 });

    return orders;

};
exports.updateDigitalOrderStatusService = async(orderId, newStatus) => {
    const validStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "served",
        "cancelled",
    ];

    if (!validStatuses.includes(newStatus)) {
        throw new Error("Invalid status");
    }

    const order = await DigitalOrder.findByIdAndUpdate(
        orderId, { status: newStatus }, { new: true }
    );

    if (!order) throw new Error("Order not found");

    return order;
};