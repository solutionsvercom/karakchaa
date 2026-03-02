/// <reference types="vite/client" />

/**
 * Api.ts — Central API endpoint configuration
 *
 * All backend URLs are derived from the VITE_API_BASE_URL environment variable
 * defined in .env.  Import the relevant constant(s) in slices and modules
 * instead of hardcoding any URL.
 *
 * Example:
 *   import { API_AUTH } from "../config/Api";
 */

const BASE = import.meta.env.VITE_API_BASE_URL;

// Auth routes  (login, register, verify-token, refresh-token, change-password)
export const API_AUTH = `${BASE}/api/auth`;

// Users sub-route under auth
export const API_USERS = `${BASE}/api/auth/users`;

// Role management
export const API_ROLES = `${BASE}/api/roles`;

// Customers
export const API_CUSTOMERS = `${BASE}/api/customers`;

// Employees
export const API_EMPLOYEES = `${BASE}/api/employees`;

// Expenses
export const API_EXPENSES = `${BASE}/api/expenses`;

// Orders
export const API_ORDERS = `${BASE}/api/orders`;

// Products
export const API_PRODUCTS = `${BASE}/api/products`;

// Reports
export const API_REPORTS = `${BASE}/api/reports`;

// Sales
export const API_SALES = `${BASE}/api/sales`;

// Stock management
export const API_STOCK = `${BASE}/api/stock`;

// Suppliers
export const API_SUPPLIERS = `${BASE}/api/suppliers`;
