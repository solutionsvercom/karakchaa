const CLOUD_FOLDER = "restaurant/products";
const DEFAULT_CLOUD_NAME = "djctmnkky";

const cloudName =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined)?.trim() ||
  DEFAULT_CLOUD_NAME;

const ABSOLUTE_HTTPS = /^https:\/\//i;
/** Cloudinary-style id stored in DB without https (e.g. a6lmjmixdnbts4jlgyfo) */
const BARE_PUBLIC_ID = /^[a-z0-9][a-z0-9_-]*$/i;

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

function deliveryUrl(publicId: string): string {
  const id = publicId
    .replace(/^\//, "")
    .replace(/\.[a-zA-Z0-9]+$/, "")
    .trim();
  if (!id) return "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${id}`;
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

  if (trimmed.includes("res.cloudinary.com")) {
    return [normalizeCloudinaryUrl(trimmed)];
  }

  if (ABSOLUTE_HTTPS.test(trimmed)) {
    return [trimmed];
  }

  const base = trimmed.replace(/\.[a-zA-Z0-9]+$/, "");
  if (BARE_PUBLIC_ID.test(base)) {
    return [
      deliveryUrl(`${CLOUD_FOLDER}/${base}`),
      deliveryUrl(base),
    ];
  }

  return [];
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
