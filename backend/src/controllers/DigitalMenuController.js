const DigitalMenuService =
    require("../services/DigitalMenuService");


exports.getDigitalMenuProducts = async(req, res) => {

    try {

        const products =
            await DigitalMenuService.getAllDigitalMenuProducts();

        res.json({
            success: true,
            products,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};