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
  const id = publicId.replace(/^\//, "").replace(/\.[a-zA-Z0-9]+$/, "");
  if (!id) return "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${id}`;
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

  const out = new Set<string>();

  if (trimmed.includes("res.cloudinary.com")) {
    out.add(normalizeCloudinaryUrl(trimmed));
    const match = trimmed.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^./]+)?$/i);
    if (match) {
      const pid = match[1].replace(/\.[a-zA-Z0-9]+$/, "");
      out.add(deliveryUrl(pid));
      const short = pid.replace(new RegExp(`^${CLOUD_FOLDER}/`), "");
      if (short !== pid) {
        out.add(deliveryUrl(short));
        out.add(deliveryUrl(`${CLOUD_FOLDER}/${short}`));
      }
    }
    return [...out];
  }

  const base = trimmed.replace(/^\//, "").replace(/\.[a-zA-Z0-9]+$/, "");
  out.add(deliveryUrl(`${CLOUD_FOLDER}/${base}`));
  out.add(deliveryUrl(base));
  return [...out];
}

export function displayImageUrl(
  url?: string | { url?: string } | null
): string {
  const candidates = getCloudinaryImageCandidates(url);
  return candidates[0] || "";
}

export function safeImageSrc(
  url?: string | { url?: string } | null
): string {
  const candidates = getCloudinaryImageCandidates(url);
  const resolved = candidates.find((u) => ABSOLUTE_HTTPS.test(u)) || "";
  if (!resolved || BARE_FILENAME.test(resolved)) return "";
  return resolved;
}
