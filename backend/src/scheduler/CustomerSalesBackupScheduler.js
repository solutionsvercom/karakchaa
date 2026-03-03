
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const ExcelJS = require("exceljs");
const { google } = require("googleapis");

const Customer = require("../models/Customers/CustomerSchema");
const Sale = require("../models/Sales/SaleSchema");

function formatDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return ""; 
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
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
  console.log("[SCHEDULER] Initializing backup + delete scheduler (MONTHLY mode)...");

  //  PRODUCTION: run on the 1st day of every month at midnight
  // Cron format: "0 0 1 * *" = minute=0, hour=0, day=1, any month, any day of week
  cron.schedule("0 0 1 * *", async () => {
    console.log("===================================================");
    console.log("[SCHEDULER] ▶ BACKUP + CLEANUP JOB STARTED (MONTHLY)");

    const now = new Date();

    console.log("[TIME] Current Date:", now.toISOString());
    console.log("---------------------------------------------------");

    try {
    
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);

      console.log("[STEP 1] Fetching customers from last 30 days...");
      console.log("[STEP 1] Date range: from", thirtyDaysAgo.toISOString(), "to", now.toISOString());
      
      const recentCustomers = await Customer.find({
        createdAt: { $gte: thirtyDaysAgo }
      }).lean();
      console.log(`[RESULT] Found ${recentCustomers.length} customers from last 30 days.`);

      console.log("[STEP 1] Fetching sales from last 30 days...");
      const recentSales = await Sale.find({
        $or: [
          { createdAt: { $gte: thirtyDaysAgo } },
          { date: { $gte: thirtyDaysAgo } }
        ]
      })
        .populate("customer", "fullName phoneNumber")
        .populate("soldBy", "name")
        .populate("product", "name productName title")
        .lean();
      console.log(`[RESULT] Found ${recentSales.length} sales from last 30 days.`);

 
      console.log("[STEP 2] Creating Excel workbook…");

      const workbook = new ExcelJS.Workbook();
      const customersSheet = workbook.addWorksheet("Customers");
      const salesSheet = workbook.addWorksheet("Sales");

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

      recentCustomers.forEach((c) => {
        customersSheet.addRow({
          _id: c._id?.toString(),
          fullName: c.fullName || c.name || "",
          phoneNumber: c.phoneNumber || c.phone || "",
          email: c.email || "",
          address: c.address || "",
          gst: c.gst || "",
          notes: c.notes || "",
          totalPurchases: c.totalPurchases ?? 0,
          totalSpent: c.totalSpent ?? 0,
          points: c.points ?? 0,
          createdAt: formatDate(c.createdAt),
        });
      });

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

      recentSales.forEach((s) => {
        const productName =
          s.product?.name ||
          s.product?.productName ||
          s.product?.title ||
          "";

        salesSheet.addRow({
          _id: s._id?.toString(),
          invoiceNumber: s.invoiceNumber || "",
          customerId: s.customer?._id?.toString() || s.customer?.toString(),
          customerName: s.customer?.fullName || "",
          customerPhone: s.customer?.phoneNumber || "",
          soldByName: s.soldBy?.name || "",
          productId:
            typeof s.product === "object"
              ? s.product?._id?.toString()
              : s.product?.toString(),
          productName,
          quantity: s.quantity ?? 0,
          totalAmount: s.totalAmount ?? 0,
          paymentMethod: s.paymentMethod || "",
          paymentStatus: s.paymentStatus || "",
          date: formatDate(s.date),
          createdAt: formatDate(s.createdAt),
        });
      });

      console.log("[STEP 2] Excel sheets populated.");

    
      const pad = (num) => String(num).padStart(2, "0");
      const yyyy = now.getFullYear();
      const mm = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const hh = pad(now.getHours());
      const min = pad(now.getMinutes());
      const ss = pad(now.getSeconds());

      const timestamp = `${yyyy}-${mm}-${dd}-${hh}-${min}-${ss}`;

      const exportsDir = path.join(PROJECT_ROOT, "exports");
      const fileName = `customer-sales-backup-${timestamp}.xlsx`;
      const filePath = path.join(exportsDir, fileName);

      console.log("[STEP 3] Saving Excel file:", filePath);

      if (!fs.existsSync(exportsDir)) {
        console.log("[STEP 3] 'exports' folder not found. Creating...");
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      await workbook.xlsx.writeFile(filePath);
      console.log("[RESULT] ✔ Excel Backup Saved Successfully");

      //  Upload Excel file to Google Drive (non-blocking to rest of job)
      try {
        await uploadToGoogleDrive(filePath, fileName);
      } catch (uploadErr) {
        console.error(
          "[GOOGLE DRIVE] ❌ Unexpected error during upload:",
          uploadErr
        );
      }

    
      const cutoffTime = now.getTime();

      console.log("---------------------------------------------------");
      console.log("[STEP 4] Deleting data older than 30 days...");
      console.log(
        "[STEP 4] Cutoff is 'now - 30 days' (based on createdAt / date)."
      );

      //  Find old customers in JS
      const oldCustomerIds = recentCustomers
        .filter((c) => {
          if (!c.createdAt) return false;
          const d = new Date(c.createdAt);
          if (isNaN(d.getTime())) return false;
          return cutoffTime - d.getTime() > THIRTY_DAYS_MS;
        })
        .map((c) => c._id);

      console.log(
        `[STEP 4] Customers older than 30 days (to delete): ${oldCustomerIds.length}`
      );

      let deleteCustomersResult = { deletedCount: 0 };
      if (oldCustomerIds.length > 0) {
        deleteCustomersResult = await Customer.deleteMany({
          _id: { $in: oldCustomerIds },
        });
      }

      console.log(
        `[RESULT] Deleted ${deleteCustomersResult.deletedCount} old customers.`
      );

      // Find old sales in JS (check createdAt OR date)
      const oldSaleIds = recentSales
        .filter((s) => {
          const candidates = [s.createdAt, s.date];
          const validDates = candidates
            .map((v) => (v ? new Date(v) : null))
            .filter((d) => d && !isNaN(d.getTime()));

          if (validDates.length === 0) return false;

          // If ANY of the dates is older than 30 days, mark as old
          return validDates.some(
            (d) => cutoffTime - d.getTime() > THIRTY_DAYS_MS
          );
        })
        .map((s) => s._id);

      console.log(
        `[STEP 4] Sales older than 30 days (to delete): ${oldSaleIds.length}`
      );

      let deleteSalesResult = { deletedCount: 0 };
      if (oldSaleIds.length > 0) {
        deleteSalesResult = await Sale.deleteMany({ _id: { $in: oldSaleIds } });
      }

      console.log(
        `[RESULT] Deleted ${deleteSalesResult.deletedCount} old sales.`
      );

      console.log("---------------------------------------------------");
      console.log("[SCHEDULER]  MONTHLY JOB FINISHED SUCCESSFULLY");
      console.log("===================================================");
    } catch (err) {
      console.log("---------------------------------------------------");
      console.error("[SCHEDULER]  ERROR in job:", err);
      console.log("===================================================");
    }
  });

  console.log(
    "[SCHEDULER] Monthly scheduler registered to run on 1st of every month at midnight ✔"
  );
}

module.exports = { registerCustomerSalesBackup };