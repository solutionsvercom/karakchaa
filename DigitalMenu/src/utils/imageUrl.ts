const CLOUD_FOLDER = "restaurant/products";
const DEFAULT_CLOUD_NAME = "djctmnkky";

const cloudName =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined)?.trim() ||
  DEFAULT_CLOUD_NAME;

const ABSOLUTE_HTTPS = /^https:\/\//i;
const BARE_PUBLIC_ID = /^[a-z0-9][a-z0-9_-]*$/i;
const HAS_IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif)(\?|$)/i;

function stripCloudinaryVersion(url: string): string {
  return url.replace(/\/upload\/v\d+\//i, "/upload/");
}

/** Keep .jpg (and other formats) — matches Cloudinary secure_url from upload */
function normalizeCloudinaryUrl(url: string): string {
  let https = url
    .replace(/^http:\/\//i, "https://")
    .replace(/^\/\//, "https://");
  https = stripCloudinaryVersion(https);

  if (https.includes("res.cloudinary.com") && !HAS_IMAGE_EXT.test(https)) {
    https = `${https}.jpg`;
  }
  return https;
}

function deliveryUrl(publicId: string, withExtension = true): string {
  const id = publicId
    .replace(/^\//, "")
    .replace(/\.[a-zA-Z0-9]+$/, "")
    .trim();
  if (!id) return "";
  const ext = withExtension ? ".jpg" : "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${id}${ext}`;
}

export function rawFromInput(url?: string | { url?: string } | null): string {
  if (!url) return "";
  if (typeof url === "string") return url.trim();
  if (typeof url === "object" && typeof url.url === "string") {
    return url.url.trim();
  }
  return "";
}

export function getCloudinaryImageCandidates(
  url?: string | { url?: string } | null
): string[] {
  const trimmed = rawFromInput(url);
  if (!trimmed) return [];

  const out = new Set<string>();

  if (trimmed.includes("res.cloudinary.com")) {
    out.add(normalizeCloudinaryUrl(trimmed));
    return [...out];
  }

  if (ABSOLUTE_HTTPS.test(trimmed)) {
    out.add(trimmed);
    return [...out];
  }

  const base = trimmed.replace(/\.[a-zA-Z0-9]+$/, "");
  if (BARE_PUBLIC_ID.test(base)) {
    out.add(deliveryUrl(`${CLOUD_FOLDER}/${base}`, true));
    out.add(deliveryUrl(`${CLOUD_FOLDER}/${base}`, false));
    out.add(deliveryUrl(base, true));
    out.add(deliveryUrl(base, false));
  }

  return [...out];
}

export function displayImageUrl(
  url?: string | { url?: string } | null
): string {
  return getCloudinaryImageCandidates(url)[0] || "";
}

export function safeImageSrc(
  url?: string | { url?: string } | null
): string {
  return displayImageUrl(url);
}

export function hasDisplayableImage(
  url?: string | { url?: string } | null
): boolean {
  return Boolean(safeImageSrc(url));
}
