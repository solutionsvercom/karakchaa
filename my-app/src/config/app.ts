/** React Router basename (matches Vite `base`, e.g. /admin) */
export const ADMIN_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "") || "/admin";

export const adminPath = (segment = "") => {
  const base = ADMIN_BASENAME;
  if (!segment) return base || "/";
  return `${base}/${segment.replace(/^\//, "")}`;
};
