const DigitalOrder = require("../models/DigitalOrder/DigitalOrderSchema");

/* ================= CREATE DIGITAL ORDER ================= */

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


    /* Calculate total */

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


/* ================= GET ORDER STATUS ================= */

exports.getDigitalOrderStatusService = async(orderId) => {

    const order = await DigitalOrder.findById(orderId);

    if (!order)
        throw new Error("Order not found");

    return order;

};


/* ================= GET ALL ORDERS ================= */

exports.getAllDigitalOrdersService = async() => {

    const orders = await DigitalOrder.find()
        .sort({ createdAt: -1 });

    return orders;

};