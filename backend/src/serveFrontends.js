const path = require("path");
const fs = require("fs");
const express = require("express");

function resolveBuildDirs() {
  const backendRoot = path.join(__dirname, "..");
  const hostingerMenu = path.join(backendRoot, "..", "DigitalMenu", "dist");
  const hostingerAdmin = path.join(hostingerMenu, "admin");
  const backendDist = path.join(backendRoot, "dist");
  const backendDistAdmin = path.join(backendDist, "admin");
  const legacyMenu = path.join(backendRoot, "public", "menu");
  const legacyAdmin = path.join(backendRoot, "public", "admin");

  if (fs.existsSync(path.join(hostingerMenu, "index.html"))) {
    return { menuDir: hostingerMenu, adminDir: hostingerAdmin };
  }
  if (fs.existsSync(path.join(backendDist, "index.html"))) {
    return { menuDir: backendDist, adminDir: backendDistAdmin };
  }
  if (fs.existsSync(path.join(legacyMenu, "index.html"))) {
    return { menuDir: legacyMenu, adminDir: legacyAdmin };
  }
  return { menuDir: hostingerMenu, adminDir: hostingerAdmin };
}

/**
 * Serves production builds:
 *   /         → DigitalMenu (dist/ or public/menu)
 *   /admin    → my-app CRM (dist/admin or public/admin)
 * API routes must be registered before calling this.
 */
function serveFrontends(app) {
  const { menuDir, adminDir } = resolveBuildDirs();
  const menuIndex = path.join(menuDir, "index.html");
  const adminIndex = path.join(adminDir, "index.html");
  const hasMenu = fs.existsSync(menuIndex);
  const hasAdmin = fs.existsSync(adminIndex);

  if (!hasMenu && !hasAdmin) {
    console.warn(
      "⚠️  Frontend builds not found. Run: cd DigitalMenu && npm run build"
    );
    app.get("/", (req, res) => {
      res.json({
        message: "Karakchaa API is running",
        health: "/api/health",
        hint: "Run npm run build in backend to serve menu and admin UI",
      });
    });
    return;
  }

  if (hasAdmin) {
    app.get("/admin", (req, res) => res.redirect(301, "/admin/"));
    app.use("/admin", express.static(adminDir, { index: "index.html" }));
    app.get(/^\/admin(\/.*)?$/, (req, res, next) => {
      if (req.path.startsWith("/admin/api")) return next();
      res.sendFile(adminIndex);
    });
    console.log("✅ Admin UI → /admin");
  }

  if (hasMenu) {
    app.use(express.static(menuDir, { index: false }));
    app.get(/^(?!\/api\/|\/admin\/).*/, (req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.path.startsWith("/api") || req.path.startsWith("/admin")) {
        return next();
      }
      res.sendFile(menuIndex);
    });
    console.log("✅ Digital menu → /");
  }
}

module.exports = serveFrontends;
