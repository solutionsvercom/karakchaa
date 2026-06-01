/**
 * Normalize product image URLs for HTTPS production (Cloudinary, etc.)
 */
function resolveProductImageUrl(image) {
  if (!image) return "";

  let url = "";
  if (typeof image === "string") {
    url = image.trim();
  } else if (typeof image === "object" && typeof image.url === "string") {
    url = image.url.trim();
  }

  if (!url) return "";

  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (url.startsWith("http://")) {
    return url.replace(/^http:\/\//i, "https://");
  }
  if (url.startsWith("https://")) {
    return url;
  }

  return "";
}

module.exports = { resolveProductImageUrl };
