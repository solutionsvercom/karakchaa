const CLOUD_FOLDER = "restaurant/products";
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;

export function displayImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://")) {
    return trimmed.replace(/^http:\/\//i, "https://");
  }
  if (trimmed.includes("res.cloudinary.com")) {
    return trimmed;
  }

  if (!cloudName) return "";

  let path = trimmed.replace(/^\//, "");
  if (!path.includes("/")) {
    path = `${CLOUD_FOLDER}/${path}`;
  }
  const publicId = path.replace(/\.[a-zA-Z0-9]+$/, "");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}
