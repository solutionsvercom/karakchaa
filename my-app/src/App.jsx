import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import DashboardPage from './pages/Dashboard/Dashboard'
import CustomerPage from './pages/Dashboard/Customers'
import EmployeesPage from './pages/Dashboard/Employees'
import ExpensesPage from './pages/Dashboard/Expenses'
import FeedbackPage from './pages/Dashboard/Feedback'
import PosPage from './pages/Dashboard/Pos'
import ProductsPage from './pages/Dashboard/Products'
import ReportsPage from './pages/Dashboard/Reports'
import SuppliersPage from './pages/Dashboard/Suppliers'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard Parent */}
        <Route path="/dashboard" element={<DashboardPage />}>
          {/* <Route index element={<Navigate to="products" />} /> */}

          <Route path="customer" element={<CustomerPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;