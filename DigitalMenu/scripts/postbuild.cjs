const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const adminDir = path.join(distDir, "admin");
const menuIndex = path.join(distDir, "index.html");
const adminIndex = path.join(adminDir, "index.html");
const myAppDist = path.join(__dirname, "..", "..", "my-app", "dist");
const myAppIndex = path.join(myAppDist, "index.html");

if (!fs.existsSync(menuIndex)) {
  console.error("Missing dist/index.html — menu build failed");
  process.exit(1);
}

if (!fs.existsSync(adminIndex) && fs.existsSync(myAppIndex)) {
  console.log("Admin output missing; copying my-app/dist -> dist/admin");
  fs.mkdirSync(adminDir, { recursive: true });
  fs.cpSync(myAppDist, adminDir, { recursive: true });
}

if (!fs.existsSync(adminIndex)) {
  console.error("Missing dist/admin/index.html — admin build failed");
  process.exit(1);
}

fs.writeFileSync(
  path.join(distDir, "build-info.json"),
  JSON.stringify({ builtAt: new Date().toISOString(), hostinger: true }, null, 2)
);

console.log("dist/ ready (menu + admin) — Hostinger output directory OK");
