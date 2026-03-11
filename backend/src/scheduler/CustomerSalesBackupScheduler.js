// src/scheduler/CustomerSalesBackupScheduler.js

const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const ExcelJS = require("exceljs");

// Your MongoDB Models
const Customer = require("../models/Customers/CustomerSchema");
const Sale = require("../models/Sales/SaleSchema");

// Helper to safely format dates
function formatDate(value) {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toISOString();
}

function registerCustomerSalesBackup() {
    console.log("[SCHEDULER] Initializing backup + delete scheduler (TEST mode)...");

    cron.schedule("*/1 * * * *", async function() {
        console.log("===================================================");
        console.log("[SCHEDULER] BACKUP + CLEANUP JOB STARTED");

        var now = new Date();
        console.log("[TIME] Current Date:", now.toISOString());
        console.log("---------------------------------------------------");

        try {
            /* =====================================================
               1 - FETCH DATA
            ===================================================== */
            console.log("[STEP 1] Fetching ALL customers...");
            var recentCustomers = await Customer.find({}).lean();
            console.log("[RESULT] Found " + recentCustomers.length + " customers.");

            console.log("[STEP 1] Fetching ALL sales...");
            var recentSales = await Sale.find({})
                .populate("customer", "fullName phoneNumber")
                .populate("soldBy", "name")
                .populate("product", "name productName title")
                .lean();
            console.log("[RESULT] Found " + recentSales.length + " sales.");

            /* =====================================================
               2 - BUILD EXCEL FILE
            ===================================================== */
            console.log("[STEP 2] Creating Excel workbook...");

            var workbook = new ExcelJS.Workbook();
            var customersSheet = workbook.addWorksheet("Customers");
            var salesSheet = workbook.addWorksheet("Sales");

            // ===== Customers sheet =====
            customersSheet.columns = [
                { header: "Customer ID", key: "_id", width: 26 },
                { header: "Full Name", key: "fullName", width: 22 },
                { header: "Phone", key: "phoneNumber", width: 16 },
                { header: "Email", key: "email", width: 25 },
                { header: "Address", key: "address", width: 30 },
                { header: "GST", key: "gst", width: 12 },
                { header: "Notes", key: "notes", width: 30 },
                { header: "Total Purchases", key: "totalPurchases", width: 16 },
                { header: "Total Spent", key: "totalSpent", width: 16 },
                { header: "Points", key: "points", width: 10 },
                { header: "Created At", key: "createdAt", width: 24 },
            ];

            recentCustomers.forEach(function(c) {
                customersSheet.addRow({
                    _id: c._id ? c._id.toString() : "",
                    fullName: c.fullName || c.name || "",
                    phoneNumber: c.phoneNumber || c.phone || "",
                    email: c.email || "",
                    address: c.address || "",
                    gst: c.gst || "",
                    notes: c.notes || "",
                    totalPurchases: (c.totalPurchases !== undefined && c.totalPurchases !== null) ? c.totalPurchases : 0,
                    totalSpent: (c.totalSpent !== undefined && c.totalSpent !== null) ? c.totalSpent : 0,
                    points: (c.points !== undefined && c.points !== null) ? c.points : 0,
                    createdAt: formatDate(c.createdAt),
                });
            });

            // ===== Sales sheet =====
            salesSheet.columns = [
                { header: "Sale ID", key: "_id", width: 26 },
                { header: "Invoice No", key: "invoiceNumber", width: 18 },
                { header: "Customer ID", key: "customerId", width: 26 },
                { header: "Customer Name", key: "customerName", width: 24 },
                { header: "Customer Phone", key: "customerPhone", width: 18 },
                { header: "Sold By", key: "soldByName", width: 20 },
                { header: "Product ID", key: "productId", width: 26 },
                { header: "Product Name", key: "productName", width: 26 },
                { header: "Quantity", key: "quantity", width: 10 },
                { header: "Total Amount", key: "totalAmount", width: 16 },
                { header: "Payment Method", key: "paymentMethod", width: 16 },
                { header: "Payment Status", key: "paymentStatus", width: 16 },
                { header: "Date (field)", key: "date", width: 24 },
                { header: "Created At (doc)", key: "createdAt", width: 24 },
            ];

            recentSales.forEach(function(s) {
                var productName = "";
                if (s.product) {
                    productName = s.product.name || s.product.productName || s.product.title || "";
                }

                var customerId = "";
                if (s.customer) {
                    if (s.customer._id) {
                        customerId = s.customer._id.toString();
                    } else {
                        customerId = s.customer.toString();
                    }
                }

                var productId = "";
                if (s.product) {
                    if (typeof s.product === "object") {
                        productId = s.product._id ? s.product._id.toString() : "";
                    } else {
                        productId = s.product.toString();
                    }
                }

                salesSheet.addRow({
                    _id: s._id ? s._id.toString() : "",
                    invoiceNumber: s.invoiceNumber || "",
                    customerId: customerId,
                    customerName: s.customer ? (s.customer.fullName || "") : "",
                    customerPhone: s.customer ? (s.customer.phoneNumber || "") : "",
                    soldByName: s.soldBy ? (s.soldBy.name || "") : "",
                    productId: productId,
                    productName: productName,
                    quantity: (s.quantity !== undefined && s.quantity !== null) ? s.quantity : 0,
                    totalAmount: (s.totalAmount !== undefined && s.totalAmount !== null) ? s.totalAmount : 0,
                    paymentMethod: s.paymentMethod || "",
                    paymentStatus: s.paymentStatus || "",
                    date: formatDate(s.date),
                    createdAt: formatDate(s.createdAt),
                });
            });

            console.log("[STEP 2] Excel sheets populated.");

            /* =====================================================
               3 - SAVE EXCEL FILE
            ===================================================== */
            var dateStr = now.toISOString().split("T")[0];
            var exportsDir = path.join(__dirname, "..", "..", "exports");
            var filePath = path.join(exportsDir, "customer-sales-backup-" + dateStr + ".xlsx");

            console.log("[STEP 3] Saving Excel file:", filePath);

            if (!fs.existsSync(exportsDir)) {
                console.log("[STEP 3] 'exports' folder not found. Creating...");
                fs.mkdirSync(exportsDir, { recursive: true });
            }

            await workbook.xlsx.writeFile(filePath);
            console.log("[RESULT] Excel Backup Saved Successfully");

            /* =====================================================
               4 - DELETE DATA OLDER THAN 1 MINUTE (TEST ONLY)
            ===================================================== */
            var ONE_MINUTE_MS = 60 * 1000;
            var cutoffTime = now.getTime();

            console.log("---------------------------------------------------");
            console.log("[STEP 4] Deleting data older than 1 minute (TEST)...");

            var oldCustomerIds = recentCustomers
                .filter(function(c) {
                    if (!c.createdAt) return false;
                    var d = new Date(c.createdAt);
                    if (isNaN(d.getTime())) return false;
                    return cutoffTime - d.getTime() > ONE_MINUTE_MS;
                })
                .map(function(c) { return c._id; });

            console.log("[STEP 4] Customers older than 1 minute (to delete): " + oldCustomerIds.length);

            var deleteCustomersResult = { deletedCount: 0 };
            if (oldCustomerIds.length > 0) {
                deleteCustomersResult = await Customer.deleteMany({
                    _id: { $in: oldCustomerIds },
                });
            }

            console.log("[RESULT] Deleted " + deleteCustomersResult.deletedCount + " old customers.");

            var oldSaleIds = recentSales
                .filter(function(s) {
                    var candidates = [s.createdAt, s.date];
                    var validDates = candidates
                        .map(function(v) { return v ? new Date(v) : null; })
                        .filter(function(d) { return d && !isNaN(d.getTime()); });

                    if (validDates.length === 0) return false;

                    return validDates.some(function(d) {
                        return cutoffTime - d.getTime() > ONE_MINUTE_MS;
                    });
                })
                .map(function(s) { return s._id; });

            console.log("[STEP 4] Sales older than 1 minute (to delete): " + oldSaleIds.length);

            var deleteSalesResult = { deletedCount: 0 };
            if (oldSaleIds.length > 0) {
                deleteSalesResult = await Sale.deleteMany({ _id: { $in: oldSaleIds } });
            }

            console.log("[RESULT] Deleted " + deleteSalesResult.deletedCount + " old sales.");

            console.log("---------------------------------------------------");
            console.log("[SCHEDULER] TEST JOB FINISHED SUCCESSFULLY");
            console.log("===================================================");
        } catch (err) {
            console.log("---------------------------------------------------");
            console.error("[SCHEDULER] ERROR in job:", err);
            console.log("===================================================");
        }
    });

    console.log("[SCHEDULER] Test scheduler registered to run every 1 minute");
}

module.exports = { registerCustomerSalesBackup };