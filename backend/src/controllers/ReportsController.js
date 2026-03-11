const { buildReports } = require("../services/ReportsService");

const getReports = async (req, res) => {
  try {
    const { period = "All Time" } = req.query;

    const reportData = await buildReports(period);

    res.status(200).json(reportData);
  } catch (error) {
    console.error("Reports Controller Error:", error);
    res.status(500).json({
      message: "Failed to generate reports",
      error: error.message,
    });
  }
};

module.exports = { getReports };
