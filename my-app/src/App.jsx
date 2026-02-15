import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from "./components/ProtectedRoute"

import DashboardPage from './pages/Dashboard/Dashboard'
import CustomerPage from './pages/Dashboard/Customers'
import EmployeesPage from './pages/Dashboard/Employees'
import ExpensesPage from './pages/Dashboard/Expenses'
import FeedbackPage from './pages/Dashboard/Feedback'
import PosPage from './pages/Dashboard/Pos'
import ProductsPage from './pages/Dashboard/Products'
import ReportsPage from './pages/Dashboard/Reports'
import SuppliersPage from './pages/Dashboard/Suppliers'
import StockmanagementPage from './pages/Dashboard/Stockmanagement'
import SalesPage from './pages/Dashboard/Sales'

import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          {/* Dashboard → All roles */}
          <Route
            index
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* POS → Admin + Staff */}
          <Route
            path="pos"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <PosPage />
              </ProtectedRoute>
            }
          />

          {/* Products → Admin + Manager */}
          <Route
            path="products/*"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager","staff"]}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />

          {/* Sales → Admin + Manager */}
          <Route
            path="sales"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <SalesPage />
              </ProtectedRoute>
            }
          />

          {/* Customers → Admin + Manager */}
          <Route
            path="customer/*"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <CustomerPage />
              </ProtectedRoute>
            }
          />

          {/* Stock Management → Admin only */}
          <Route
            path="stockmanagement"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StockmanagementPage />
              </ProtectedRoute>
            }
          />

          {/* Suppliers → Admin only */}
          <Route
            path="suppliers/*"
            element={
              <ProtectedRoute allowedRoles={["admin","manager"]}>
                <SuppliersPage />
              </ProtectedRoute>
            }
          />

          {/* Employees → Admin only */}
          <Route
            path="employees/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />

          {/* Reports → Admin only */}
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Expenses → Admin only */}
          <Route
            path="expenses/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />

          {/* Feedback → All roles */}
          <Route
            path="feedback"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* Catch all → redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
