const cloudinary = require("../../config/cloudinary");

const CLOUDINARY_FOLDER = "restaurant/products";

function extractRaw(image) {
  if (!image) return "";
  if (typeof image === "string") return image.trim();
  if (typeof image === "object" && typeof image.url === "string") {
    return image.url.trim();
  }
  return "";
}

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

function stripCloudinaryVersion(url) {
  return url.replace(/\/upload\/v\d+\//i, "/upload/");
}

function buildDeliveryUrl(publicId) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

/** Candidate public_ids to try in Cloudinary (folder vs root, with/without ext) */
function publicIdCandidates(raw) {
  const base = raw.replace(/^\//, "").trim();
  const noExt = base.replace(/\.[a-zA-Z0-9]+$/, "");
  const ids = new Set();

  if (base.includes("res.cloudinary.com")) {
    const pid = toPublicId(base);
    if (pid) ids.add(pid);
    return [...ids];
  }

  ids.add(`${CLOUDINARY_FOLDER}/${noExt}`);
  ids.add(noExt);
  if (base.includes("/")) {
    ids.add(base.replace(/\.[a-zA-Z0-9]+$/, ""));
  }
  ids.add(`${CLOUDINARY_FOLDER}/${base}`);

  return [...ids];
}

async function fetchSecureUrlFromCloudinary(publicId) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "image",
    });
    return result.secure_url || result.url || "";
  } catch {
    return "";
  }
}

/**
 * Resolve image to a working Cloudinary HTTPS URL (sync — best-effort, no API call).
 */
function resolveProductImageUrl(image) {
  const raw = extractRaw(image);
  if (!raw) return "";

  if (raw.startsWith("//")) return stripCloudinaryVersion(`https:${raw}`);
  if (/^https?:\/\//i.test(raw)) {
    return stripCloudinaryVersion(raw.replace(/^http:\/\//i, "https://"));
  }

  const publicId = toPublicId(raw);
  if (!publicId) return "";

  try {
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: "image",
      force_version: false,
    });
  } catch {
    return buildDeliveryUrl(publicId);
  }
}

/**
 * Resolve via Cloudinary Admin API — returns real secure_url if asset exists.
 */
async function resolveProductImageUrlAsync(image) {
  const raw = extractRaw(image);
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw) || raw.startsWith("//")) {
    const https = raw.startsWith("//")
      ? `https:${raw}`
      : raw.replace(/^http:\/\//i, "https://");
    const pid = toPublicId(https);
    if (pid) {
      const fromApi = await fetchSecureUrlFromCloudinary(pid);
      if (fromApi) return fromApi;
    }
    return https;
  }

  for (const publicId of publicIdCandidates(raw)) {
    const fromApi = await fetchSecureUrlFromCloudinary(publicId);
    if (fromApi) return fromApi;
  }

  return resolveProductImageUrl(image);
}

function withResolvedImage(doc) {
  if (!doc) return doc;
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  const url = resolveProductImageUrl(plain.image);
  if (url) {
    plain.image = {
      ...(plain.image && typeof plain.image === "object" ? plain.image : {}),
      url,
    };
  }
  return plain;
}

async function withResolvedImageAsync(doc) {
  if (!doc) return doc;
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  const url = await resolveProductImageUrlAsync(plain.image);
  if (url) {
    plain.image = {
      ...(plain.image && typeof plain.image === "object" ? plain.image : {}),
      url,
    };
  } else {
    plain.image = { url: "" };
  }
  return plain;
}

module.exports = {
  resolveProductImageUrl,
  resolveProductImageUrlAsync,
  withResolvedImage,
  withResolvedImageAsync,
};
