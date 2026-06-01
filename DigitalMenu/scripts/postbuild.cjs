const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const menuIndex = path.join(distDir, "index.html");
const adminIndex = path.join(distDir, "admin", "index.html");

if (!fs.existsSync(menuIndex)) {
  console.error("❌ Missing dist/index.html — menu build failed");
  process.exit(1);
}

if (!fs.existsSync(adminIndex)) {
  console.error("❌ Missing dist/admin/index.html — admin build failed");
  process.exit(1);
}

fs.writeFileSync(
  path.join(distDir, "build-info.json"),
  JSON.stringify({ builtAt: new Date().toISOString(), hostinger: true }, null, 2)
);

console.log("✅ dist/ ready (menu + admin) — Hostinger output directory OK");
