/**
 * Verifies frontend build output for Hostinger (expects a `dist` folder).
 */
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const menuIndex = path.join(distDir, "index.html");
const adminIndex = path.join(distDir, "admin", "index.html");

if (!fs.existsSync(menuIndex)) {
  console.error("❌ Missing dist/index.html (Digital Menu build)");
  process.exit(1);
}

if (!fs.existsSync(adminIndex)) {
  console.error("❌ Missing dist/admin/index.html (Admin build)");
  process.exit(1);
}

fs.writeFileSync(
  path.join(distDir, "build-info.json"),
  JSON.stringify(
    {
      builtAt: new Date().toISOString(),
      menu: true,
      admin: true,
    },
    null,
    2
  )
);

console.log("✅ dist/ is ready (menu + admin) for Hostinger");
