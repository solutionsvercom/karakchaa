const CLOUD_FOLDER = "restaurant/products";
const DEFAULT_CLOUD_NAME = "djctmnkky";

const cloudName =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined)?.trim() ||
  DEFAULT_CLOUD_NAME;

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

  let path = trimmed.replace(/^\//, "");
  if (!path.includes("/")) {
    path = `${CLOUD_FOLDER}/${path}`;
  }
  const publicId = path.replace(/\.[a-zA-Z0-9]+$/, "");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}
