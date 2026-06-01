/// <reference types="vite/client" />

const apiRoot = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const API_DIGITAL_MENU = `${apiRoot}/api/digital-menu`;
export const API_SETTINGS = `${apiRoot}/api/settings`;
