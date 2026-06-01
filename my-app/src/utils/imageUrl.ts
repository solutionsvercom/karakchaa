const BARE_FILENAME = /^[^/\\]+\.(jpe?g|png|gif|webp|avif)$/i;
const ABSOLUTE_HTTPS = /^https:\/\//i;

function stripCloudinaryVersion(url: string): string {
  return url.replace(/\/upload\/v\d+\//i, "/upload/");
}

function stripDeliveryExtension(url: string): string {
  return url.replace(
    /(\/image\/upload\/(?:v\d+\/)?)(.+)\.(jpe?g|png|gif|webp|avif)$/i,
    "$1$2"
  );
}

function normalizeCloudinaryUrl(url: string): string {
  const https = url
    .replace(/^http:\/\//i, "https://")
    .replace(/^\/\//, "https://");
  return stripDeliveryExtension(stripCloudinaryVersion(https));
}

function rawFromInput(url?: string | { url?: string } | null): string {
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

  if (BARE_FILENAME.test(trimmed)) return [];

  if (!trimmed.includes("res.cloudinary.com")) {
    if (ABSOLUTE_HTTPS.test(trimmed)) return [trimmed];
    return [];
  }

  return [normalizeCloudinaryUrl(trimmed)];
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
