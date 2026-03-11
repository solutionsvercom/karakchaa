const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const ExcelJS = require("exceljs");
const { google } = require("googleapis");

// ✅ Your MongoDB Models
const Customer = require("../models/Customers/CustomerSchema");
const Sale = require("../models/Sales/SaleSchema");

// 🔧 Helper to safely format dates (handles Date, string, null, invalid)
function formatDate(value) {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return ""; // invalid date
    return d.toISOString();
}

const PROJECT_ROOT = path.join(__dirname, "..", "..");
const GOOGLE_CREDENTIALS_PATH = path.join(
    PROJECT_ROOT,
    "google-oauth-credentials.json"
);
const GOOGLE_TOKEN_PATH = path.join(PROJECT_ROOT, "google-drive-token.json");

//  Load Google OAuth2 credentials JSON
function loadGoogleCredentials() {
    try {
        if (!fs.existsSync(GOOGLE_CREDENTIALS_PATH)) {
            console.log(
                "[GOOGLE DRIVE] Credentials file not found at:",
                GOOGLE_CREDENTIALS_PATH
            );
            console.log(
                '[GOOGLE DRIVE] Skipping Drive upload. Run "node authenticate-google-drive.js" after creating credentials.'
            );
            return null;
        }

        const raw = fs.readFileSync(GOOGLE_CREDENTIALS_PATH, "utf8");
        const parsed = JSON.parse(raw);

        const installed = parsed.installed || parsed.web;
        if (!installed) {
            console.log(
                "[GOOGLE DRIVE] Invalid credentials format. Expected 'installed' or 'web' key."
            );
            return null;
        }

        const { client_id, client_secret, redirect_uris } = installed;
        if (!client_id || !client_secret || !redirect_uris || !redirect_uris.length) {
            console.log(
                "[GOOGLE DRIVE] Missing client_id/client_secret/redirect_uris in credentials."
            );
            return null;
        }

        return {
            clientId: client_id,
            clientSecret: client_secret,
            redirectUri: redirect_uris[0],
        };
    } catch (err) {
        console.error("[GOOGLE DRIVE] Error reading credentials file:", err);
        return null;
    }
}

// Load stored token JSON
function loadGoogleToken() {
    try {
        if (!fs.existsSync(GOOGLE_TOKEN_PATH)) {
            console.log(
                "[GOOGLE DRIVE] Token file not found at:",
                GOOGLE_TOKEN_PATH
            );
            console.log(
                '[GOOGLE DRIVE] Skipping Drive upload. Run "node authenticate-google-drive.js" to generate google-drive-token.json.'
            );
            return null;
        }

        const raw = fs.readFileSync(GOOGLE_TOKEN_PATH, "utf8");
        return JSON.parse(raw);
    } catch (err) {
        console.error("[GOOGLE DRIVE] Error reading token file:", err);
        return null;
    }
}

//  Get authenticated Google Drive client (OAuth2, personal Gmail)
function getGoogleDriveClient() {
    console.log("[GOOGLE DRIVE] Authenticating...");

    const creds = loadGoogleCredentials();
    if (!creds) return null;

    const token = loadGoogleToken();
    if (!token) return null;

    try {
        const oAuth2Client = new google.auth.OAuth2(
            creds.clientId,
            creds.clientSecret,
            creds.redirectUri
        );

        oAuth2Client.setCredentials(token);

        const drive = google.drive({ version: "v3", auth: oAuth2Client });
        return drive;
    } catch (err) {
        console.error("[GOOGLE DRIVE] Error creating OAuth2 client:", err);
        return null;
    }
}

//  Upload an Excel file to Google Drive
async function uploadToGoogleDrive(filePath, fileName) {
    console.log(`[GOOGLE DRIVE] Uploading file: ${fileName}`);

    const drive = getGoogleDriveClient();
    if (!drive) {
        console.log("[GOOGLE DRIVE] Drive client not available. Upload skipped.");
        return;
    }

    if (!fs.existsSync(filePath)) {
        console.log("[GOOGLE DRIVE] Local file not found. Upload skipped.");
        return;
    }

    try {
        const fileMetadata = {
            name: fileName,
        };

        const media = {
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media,
            fields: "id, name, webViewLink, webContentLink",
        });

        const file = response.data;

        console.log("[GOOGLE DRIVE] ✔ Upload successful!");
        console.log("[GOOGLE DRIVE] File ID:", file.id);
        console.log("[GOOGLE DRIVE] View Link:", file.webViewLink);

        // Optional: delete local file after successful upload
        try {
            fs.unlinkSync(filePath);
            console.log("[GOOGLE DRIVE] Local file deleted after successful upload.");
        } catch (deleteErr) {
            console.error(
                "[GOOGLE DRIVE] Could not delete local file after upload:",
                deleteErr
            );
        }
    } catch (err) {
        console.error("[GOOGLE DRIVE] ❌ Upload failed:", err);
        // Keep local backup if upload fails
    }
}

function registerCustomerSalesBackup() {
    console.log("[SCHEDULER] Initializing backup + delete scheduler (TEST mode)...");

    // 🔁 TEST: run every 1 minute
    cron.schedule("*/1 * * * *", async() => {
        console.log("===================================================");
        console.log("[SCHEDULER] ▶ BACKUP + CLEANUP JOB STARTED");

        var now = new Date();
        console.log("[TIME] Current Date:", now.toISOString());
        console.log("---------------------------------------------------");

        try {
            /* =====================================================
               1️⃣ FETCH DATA (TEST: ALL RECORDS)
            ===================================================== */
            console.log("[STEP 1] Fetching ALL customers...");
            const recentCustomers = await Customer.find({}).lean();
            console.log(`[RESULT] Found ${recentCustomers.length} customers.`);

            console.log("[STEP 1] Fetching ALL sales...");
            const recentSales = await Sale.find({})
                .populate("customer", "fullName phoneNumber")
                .populate("soldBy", "name")
                .populate("product", "name productName title")
                .lean();
            console.log(`[RESULT] Found ${recentSales.length} sales.`);

            /* =====================================================
               2️⃣ BUILD EXCEL FILE
            ===================================================== */
            console.log("[STEP 2] Creating Excel workbook…");

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
               3️⃣ SAVE EXCEL FILE
            ===================================================== */
            const dateStr = now.toISOString().split("T")[0];
            const exportsDir = path.join(__dirname, "..", "..", "exports");
            const filePath = path.join(
                exportsDir,
                `customer-sales-backup-${dateStr}.xlsx`
            );

            console.log("[STEP 3] Saving Excel file:", filePath);

            if (!fs.existsSync(exportsDir)) {
                console.log("[STEP 3] 'exports' folder not found. Creating...");
                fs.mkdirSync(exportsDir, { recursive: true });
            }

            await workbook.xlsx.writeFile(filePath);
            console.log("[RESULT] Excel Backup Saved Successfully");

            /* =====================================================
               4️⃣ DELETE DATA OLDER THAN 1 MINUTE (TEST ONLY)
               - We use JS to decide which docs are "old"
               - Then delete via _id to avoid any type issues
            ===================================================== */
            const ONE_MINUTE_MS = 60 * 1000;
            const cutoffTime = now.getTime();

            console.log("---------------------------------------------------");
            console.log("[STEP 4] Deleting data older than 1 minute (TEST)...");
            console.log(
                "[STEP 4] Cutoff is 'now - 1 minute' (based on createdAt / date)."
            );

            // 🧮 Find old customers in JS
            const oldCustomerIds = recentCustomers
                .filter((c) => {
                    if (!c.createdAt) return false;
                    const d = new Date(c.createdAt);
                    if (isNaN(d.getTime())) return false;
                    return cutoffTime - d.getTime() > ONE_MINUTE_MS;
                })
                .map((c) => c._id);

            console.log(
                `[STEP 4] Customers older than 1 minute (to delete): ${oldCustomerIds.length}`
            );

            var deleteCustomersResult = { deletedCount: 0 };
            if (oldCustomerIds.length > 0) {
                deleteCustomersResult = await Customer.deleteMany({
                    _id: { $in: oldCustomerIds },
                });
            }

            console.log("[RESULT] Deleted " + deleteCustomersResult.deletedCount + " old customers.");

            // 🧮 Find old sales in JS (check createdAt OR date)
            const oldSaleIds = recentSales
                .filter((s) => {
                    const candidates = [s.createdAt, s.date];
                    const validDates = candidates
                        .map((v) => (v ? new Date(v) : null))
                        .filter((d) => d && !isNaN(d.getTime()));

                    if (validDates.length === 0) return false;

                    // If ANY of the dates is older than 1 minute, mark as old
                    return validDates.some(
                        (d) => cutoffTime - d.getTime() > ONE_MINUTE_MS
                    );
                })
                .map((s) => s._id);

            console.log(
                `[STEP 4] Sales older than 1 minute (to delete): ${oldSaleIds.length}`
            );

            let deleteSalesResult = { deletedCount: 0 };
            if (oldSaleIds.length > 0) {
                deleteSalesResult = await Sale.deleteMany({ _id: { $in: oldSaleIds } });
            }

            console.log("[RESULT] Deleted " + deleteSalesResult.deletedCount + " old sales.");

            console.log("---------------------------------------------------");
            console.log("[SCHEDULER] ✅ TEST JOB FINISHED SUCCESSFULLY");
            console.log("===================================================");
        } catch (err) {
            console.log("---------------------------------------------------");
            console.error("[SCHEDULER] ❌ ERROR in job:", err);
            console.log("===================================================");
        }
    });

    console.log(
        "[SCHEDULER] Test scheduler registered to run every 1 minute ✔"
    );
}

module.exports = { registerCustomerSalesBackup };