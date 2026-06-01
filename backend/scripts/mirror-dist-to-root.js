/**
 * Hostinger often uses the Git repo root and looks for ./dist there.
 * Our Vite builds write to backend/dist — mirror that to <repo>/dist.
 */
const fs = require("fs");
const path = require("path");

const backendDist = path.join(__dirname, "..", "dist");
const repoRoot = path.join(__dirname, "..", "..");
const rootPackage = path.join(repoRoot, "package.json");
const rootDist = path.join(repoRoot, "dist");

if (!fs.existsSync(path.join(backendDist, "index.html"))) {
  console.error("❌ backend/dist/index.html missing — run npm run build in backend first");
  process.exit(1);
}

if (!fs.existsSync(rootPackage)) {
  console.log("ℹ️  No repo-root package.json — skip dist mirror");
  process.exit(0);
}

fs.rmSync(rootDist, { recursive: true, force: true });
fs.cpSync(backendDist, rootDist, { recursive: true });

console.log("✅ Mirrored backend/dist → dist/ (repo root for Hostinger)");
