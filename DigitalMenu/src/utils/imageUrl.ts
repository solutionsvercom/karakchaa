const CLOUD_FOLDER = "restaurant/products";
const DEFAULT_CLOUD_NAME = "djctmnkky";

const cloudName =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined)?.trim() ||
  DEFAULT_CLOUD_NAME;

const BARE_FILENAME = /^[^/\\]+\.(jpe?g|png|gif|webp|avif)$/i;
const ABSOLUTE_HTTPS = /^https:\/\//i;

function stripCloudinaryVersion(url: string): string {
  return url.replace(/\/upload\/v\d+\//i, "/upload/");
}

function rawFromInput(url?: string | { url?: string } | null): string {
  if (!url) return "";
  if (typeof url === "string") return url.trim();
  if (typeof url === "object" && typeof url.url === "string") {
    return url.url.trim();
  }
  return "";
}

function buildCloudinaryUrl(trimmed: string): string {
  let path = trimmed.replace(/^\//, "");
  if (!path.includes("/")) {
    path = `${CLOUD_FOLDER}/${path}`;
  }
  const publicId = path.replace(/\.[a-zA-Z0-9]+$/, "");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

/** Full HTTPS Cloudinary URL (handles bare filenames and object.image from API) */
export function displayImageUrl(
  url?: string | { url?: string } | null
): string {
  const trimmed = rawFromInput(url);
  if (!trimmed) return "";

  if (trimmed.startsWith("//")) return stripCloudinaryVersion(`https:${trimmed}`);
  if (trimmed.startsWith("http://")) {
    return stripCloudinaryVersion(
      trimmed.replace(/^http:\/\//i, "https://")
    );
  }
  if (trimmed.includes("res.cloudinary.com")) {
    return stripCloudinaryVersion(trimmed);
  }

  return buildCloudinaryUrl(trimmed);
}

/**
 * Safe for <img src> — never returns a relative filename (prevents karakcha.in/foo.jpg 404s).
 */
export function safeImageSrc(
  url?: string | { url?: string } | null
): string {
  let resolved = displayImageUrl(url);
  if (!resolved) return "";
  if (BARE_FILENAME.test(resolved)) {
    resolved = buildCloudinaryUrl(resolved);
  }
  if (!ABSOLUTE_HTTPS.test(resolved)) return "";
  return resolved;
}
