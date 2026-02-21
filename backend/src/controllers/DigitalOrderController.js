const DigitalOrderService =
    require("../services/DigitalOrderService");


exports.createDigitalOrder = async(req, res) => {

    try {

        const order =
            await DigitalOrderService.createDigitalOrderService(
                req.body
            );

        res.status(201).json({
            success: true,
            order,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};



exports.getDigitalOrderStatus = async(req, res) => {

    try {

        const order =
            await DigitalOrderService.getDigitalOrderStatusService(
                req.params.orderId
            );

        res.json({
            success: true,
            order,
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message,
        });

    }

};



exports.getAllDigitalOrders = async(req, res) => {

    try {

        const orders =
            await DigitalOrderService.getAllDigitalOrdersService();

        res.json({
            success: true,
            orders,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
exports.updateDigitalOrderStatus = async(req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await DigitalOrderService.updateDigitalOrderStatusService(
            orderId,
            status
        );

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};