import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import { verifyToken, setInitialized } from "./features/AuthSlice";

import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardPage from "./pages/Dashboard/Dashboard";
import CustomerPage from "./pages/Dashboard/Customers";
import EmployeesPage from "./pages/Dashboard/Employees";
import ExpensesPage from "./pages/Dashboard/Expenses";
import FeedbackPage from "./pages/Dashboard/Feedback";
import PosPage from "./pages/Dashboard/Pos";
import ProductsPage from "./pages/Dashboard/Products";
import ReportsPage from "./pages/Dashboard/Reports";
import SuppliersPage from "./pages/Dashboard/Suppliers";
import StockmanagementPage from "./pages/Dashboard/Stockmanagement";
import SalesPage from "./pages/Dashboard/Sales";
import UsersPage from "./pages/Dashboard/Users";
import RolesPage from "./pages/Dashboard/Roles";

import Login from "./pages/Login";

import { useAppDispatch, useAppSelector } from "./hooks/hooks";

/* 
   MODULE → ROUTE mapping (no TypeScript types)
 */
const MODULE_ROUTES = {
  dashboard:        "/dashboard/home",
  pos:              "/dashboard/pos",
  products:         "/dashboard/products",
  customer:         "/dashboard/customer",
  customers:        "/dashboard/customer",
  stockmanagement:  "/dashboard/stockmanagement",
  sales:            "/dashboard/sales",
  suppliers:        "/dashboard/suppliers",
  employees:        "/dashboard/employees",
  expenses:         "/dashboard/expenses",
  reports:          "/dashboard/reports",
  feedback:         "/dashboard/feedback",
  users:            "/dashboard/users",
  roles:            "/dashboard/roles",
};

const MODULE_PRIORITY = [
  "dashboard", "pos", "sales", "products", "customer",
  "stockmanagement", "suppliers", "employees",
  "expenses", "reports", "feedback", "users", "roles",
];

/*
   SMART REDIRECT
 */
function DashboardRedirect() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/dashboard/home", { replace: true });
      return;
    }

    // Normalize all user modules to lowercase
    const userModules = (user.modules || []).map((m) => m.toLowerCase());

    // Find the highest-priority module this user has
    const firstModule = MODULE_PRIORITY.find((mod) =>
      userModules.includes(mod) || userModules.includes(mod + "s")
    );

    if (firstModule) {
      navigate(MODULE_ROUTES[firstModule], { replace: true });
    } else {
      navigate("/dashboard/no-access", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #8b5cf6",
        borderRadius: "50%",
        width: "40px", height: "40px",
        animation: "spin 1s linear infinite",
      }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* 
   NO ACCESS PAGE
 */
function NoAccessPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
      <div style={{
        backgroundColor: "white", padding: "48px", borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)", textAlign: "center", maxWidth: "420px",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <h2 style={{ color: "#1f2937", marginBottom: "8px", fontSize: "20px" }}>No Modules Assigned</h2>
        <p style={{ color: "#6b7280", marginBottom: "4px" }}>
          Your account doesn't have access to any modules yet.
        </p>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "8px" }}>
          Logged in as: <strong>{user?.name}</strong> ({user?.role})
        </p>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Please contact your administrator to request access.
        </p>
      </div>
    </div>
  );
}

/* 
   MAIN APP
 */
function App() {
  const dispatch = useAppDispatch();
  const { initializing } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    
    if (storedToken) {
      // Token exists, verify it
      dispatch(verifyToken());
    } else {
      // No token, skip initialization and go to login
      dispatch(setInitialized());
    }
  }, [dispatch]);

  if (initializing) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f5f5f5" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            border: "4px solid #f3f3f3", borderTop: "4px solid #8b5cf6",
            borderRadius: "50%", width: "50px", height: "50px",
            animation: "spin 1s linear infinite", margin: "0 auto 20px"
          }} />
          <p style={{ color: "#666" }}>Initializing...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

          {/* Smart redirect based on user modules */}
          <Route index element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

          {/* Dashboard home - requires dashboard module */}
          <Route path="home" element={<ProtectedRoute requiredModule="dashboard"><DashboardPage /></ProtectedRoute>} />

          {/* No modules assigned */}
          <Route path="no-access" element={<NoAccessPage />} />

          <Route path="pos" element={<ProtectedRoute requiredModule="pos"><PosPage /></ProtectedRoute>} />
          <Route path="pos/create-sale" element={<ProtectedRoute requiredModule="pos"><PosPage /></ProtectedRoute>} />

          <Route path="products/*" element={<ProtectedRoute requiredModule="products"><ProductsPage /></ProtectedRoute>} />
          

          <Route path="customer" element={<ProtectedRoute requiredModule="customer"><CustomerPage /></ProtectedRoute>} />
          <Route path="customer/add-customer" element={<ProtectedRoute requiredModule="customer"><CustomerPage /></ProtectedRoute>} />
          <Route path="customer/:id/edit-customer" element={<ProtectedRoute requiredModule="customer"><CustomerPage /></ProtectedRoute>} />

          <Route path="stockmanagement" element={<ProtectedRoute requiredModule="stockmanagement"><StockmanagementPage /></ProtectedRoute>} />
          <Route path="stockmanagement/stock-history" element={<ProtectedRoute requiredModule="stockmanagement"><StockmanagementPage /></ProtectedRoute>} />
          <Route path="stockmanagement/:id/add-stock" element={<ProtectedRoute requiredModule="stockmanagement"><StockmanagementPage /></ProtectedRoute>} />
          <Route path="stockmanagement/:id/remove-stock" element={<ProtectedRoute requiredModule="stockmanagement"><StockmanagementPage /></ProtectedRoute>} />

          <Route path="sales" element={<ProtectedRoute requiredModule="sales"><SalesPage /></ProtectedRoute>} />
          <Route path="suppliers/*" element={<ProtectedRoute requiredModule="suppliers"><SuppliersPage /></ProtectedRoute>} />
          <Route path="employees/*" element={<ProtectedRoute requiredModule="employees"><EmployeesPage /></ProtectedRoute>} />
          <Route path="employees/add-employee" element={<ProtectedRoute requiredModule="employees"><EmployeesPage /></ProtectedRoute>} />
          <Route path="employees/:id/edit-employee" element={<ProtectedRoute requiredModule="employees"><EmployeesPage /></ProtectedRoute>} />

          <Route path="expenses/*" element={<ProtectedRoute requiredModule="expenses"><ExpensesPage /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute requiredModule="reports"><ReportsPage /></ProtectedRoute>} />
          <Route path="feedback" element={<ProtectedRoute requiredModule="feedback"><FeedbackPage /></ProtectedRoute>} />

          <Route path="users" element={<ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute>} />
          <Route path="users/add-user" element={<ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute>} />
          <Route path="users/:id/edit-user" element={<ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute>} />

          <Route path="roles" element={<ProtectedRoute allowedRoles={["admin"]}><RolesPage /></ProtectedRoute>} />
          <Route path="roles/add-role" element={<ProtectedRoute allowedRoles={["admin"]}><RolesPage /></ProtectedRoute>} />
          <Route path="roles/:id/edit-role" element={<ProtectedRoute allowedRoles={["admin"]}><RolesPage /></ProtectedRoute>} />

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;