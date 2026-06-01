const cloudinary = require("../../config/cloudinary");

const CLOUDINARY_FOLDER = "restaurant/products";

/** Turn DB value (filename, public_id, or full URL) into a public_id for Cloudinary */
function toPublicId(stored) {
  let id = String(stored).replace(/^\//, "").trim();
  if (!id) return "";

  if (id.includes("res.cloudinary.com")) {
    const match = id.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^./]+)?$/);
    return match ? match[1] : "";
  }

  if (!id.includes("/")) {
    id = `${CLOUDINARY_FOLDER}/${id}`;
  }

  return id.replace(/\.[a-zA-Z0-9]+$/, "");
}

/**
 * Normalize product image for API responses.
 * DB often has only "abc123.jpg" — browser needs full https://res.cloudinary.com/... URL.
 */
function resolveProductImageUrl(image) {
  if (!image) return "";

  let raw = "";
  if (typeof image === "string") {
    raw = image.trim();
  } else if (typeof image === "object" && typeof image.url === "string") {
    raw = image.url.trim();
  }

  if (!raw) return "";

  if (raw.startsWith("//")) {
    return `https:${raw}`;
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/^http:\/\//i, "https://");
  }

  const publicId = toPublicId(raw);
  if (!publicId) return "";

  try {
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: "image",
    });
  } catch {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return "";
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
  }
}

function withResolvedImage(doc) {
  if (!doc) return doc;
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  const url = resolveProductImageUrl(plain.image);
  if (url) {
    plain.image = { ...(plain.image && typeof plain.image === "object" ? plain.image : {}), url };
  }
  return plain;
}

module.exports = {
  resolveProductImageUrl,
  withResolvedImage,
};
