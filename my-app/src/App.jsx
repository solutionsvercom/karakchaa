import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          {/* Dashboard */}
          <Route
            index
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* POS */}
          <Route
            path="pos"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
                <PosPage />
              </ProtectedRoute>
            }
          />

          {/* PRODUCTS */}
          <Route
            path="products/*"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />

          {/* CUSTOMERS */}
          <Route
            path="customer"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <CustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="customer/add-customer"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <CustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="customer/:id/edit-customer"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <CustomerPage />
              </ProtectedRoute>
            }
          />

          {/* STOCK MANAGEMENT */}
          <Route
            path="stockmanagement"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <StockmanagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="stockmanagement/stock-history"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <StockmanagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="stockmanagement/:id/add-stock"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <StockmanagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="stockmanagement/:id/remove-stock"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <StockmanagementPage />
              </ProtectedRoute>
            }
          />

          {/* SALES */}
          <Route
            path="sales"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <SalesPage />
              </ProtectedRoute>
            }
          />

          {/* SUPPLIERS */}
          <Route
            path="suppliers/*"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <SuppliersPage />
              </ProtectedRoute>
            }
          />

          {/* EMPLOYEES */}
          <Route
            path="employees"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employees/add-employee"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employees/:id/edit-employee"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />

          {/* EXPENSES */}
          <Route
            path="expenses/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />

          {/* REPORTS */}
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* FEEDBACK */}
          <Route
            path="feedback"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />

          {/* USERS */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/add-user"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/:id/edit-user"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* ROLES */}
          <Route
            path="roles"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RolesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="roles/add-role"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RolesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="roles/:id/edit-role"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RolesPage />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
