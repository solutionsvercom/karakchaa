const { resolveProductImageUrl } = require("../utils/imageUrl");

function fixImageField(value) {
  if (!value) return value;
  if (typeof value === "string") {
    const fixed = resolveProductImageUrl(value);
    return fixed || value;
  }
  if (typeof value === "object" && typeof value.url === "string") {
    const fixed = resolveProductImageUrl(value);
    if (fixed) return { ...value, url: fixed };
  }
  return value;
}

function walkPayload(payload) {
  if (!payload) return;
  if (Array.isArray(payload)) {
    payload.forEach((item) => {
      if (item && typeof item === "object" && "image" in item) {
        item.image = fixImageField(item.image);
      }
      walkPayload(item);
    });
    return;
  }
  if (typeof payload !== "object") return;

  if ("image" in payload) {
    payload.image = fixImageField(payload.image);
  }

  for (const key of Object.keys(payload)) {
    const val = payload[key];
    if (val && typeof val === "object") walkPayload(val);
  }
}

/** Ensures API JSON never exposes bare filenames as image URLs. */
function normalizeImageUrlsMiddleware(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = function normalizeJson(body) {
    try {
      if (body && typeof body === "object") {
        if (Array.isArray(body.products)) walkPayload(body.products);
        if (Array.isArray(body.data)) walkPayload(body.data);
        else if (body.data && typeof body.data === "object") walkPayload(body.data);
      }
    } catch (err) {
      console.warn("normalizeImageUrls:", err.message);
    }
    return originalJson(body);
  };
  next();
}

module.exports = normalizeImageUrlsMiddleware;
