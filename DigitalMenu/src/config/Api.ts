/// <reference types="vite/client" />

/**
 * Api.ts — Central API endpoint configuration for DigitalMenu
 *
 * The backend base URL is read from VITE_API_DIGITAL_MENU in the .env file.
 * Import the relevant constant(s) in slices instead of hardcoding any URL.
 *
 * Example:
 *   import { API_DIGITAL_MENU } from "../config/Api";
 */

export const API_DIGITAL_MENU = import.meta.env.VITE_API_DIGITAL_MENU as string;
