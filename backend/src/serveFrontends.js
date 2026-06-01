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

const hasFileExtension = (urlPath) => /\.[a-zA-Z0-9]+$/.test(urlPath);

/**
 * Serves production builds:
 *   /         → DigitalMenu
 *   /admin    → my-app CRM (no trailing-slash redirects — avoids Hostinger loops)
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
        hint: "Run npm run build in DigitalMenu to serve menu and admin UI",
      });
    });
    return;
  }

  if (hasAdmin) {
    app.use(
      "/admin",
      express.static(adminDir, {
        index: false,
        redirect: false,
      })
    );

    const sendAdminSpa = (req, res) => {
      res.sendFile(adminIndex);
    };

    app.get("/admin", sendAdminSpa);
    app.get("/admin/", sendAdminSpa);
    app.get("/admin/*", (req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (hasFileExtension(req.path)) return next();
      sendAdminSpa(req, res);
    });

    console.log("✅ Admin UI → /admin");
  }

  if (hasMenu) {
    app.use(
      express.static(menuDir, {
        index: false,
        redirect: false,
      })
    );

    app.get("/", (req, res) => res.sendFile(menuIndex));

    app.get("*", (req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.path.startsWith("/api") || req.path.startsWith("/admin")) {
        return next();
      }
      if (hasFileExtension(req.path)) return next();
      res.sendFile(menuIndex);
    });

    console.log("✅ Digital menu → /");
  }
}

module.exports = serveFrontends;
