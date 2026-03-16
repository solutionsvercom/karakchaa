const Settings = require("../models/Settings");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create defaults if not exists
      settings = await Settings.create({});
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error fetching settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { gstRate, discountType, discountValue, storeName } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (gstRate !== undefined) settings.gstRate = gstRate;
    if (discountType !== undefined) settings.discountType = discountType;
    if (discountValue !== undefined) settings.discountValue = discountValue;
    if (storeName !== undefined) settings.storeName = storeName;

    await settings.save();

    return res.status(200).json({ success: true, data: settings, message: "Settings updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error updating settings" });
  }
};
