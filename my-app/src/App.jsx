import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DashboardPage from './pages/Dashboard/Dashboard.tsx'
import CustomerPage from './pages/Dashboard/Customers.tsx'
import EmployeesPage from './pages/Dashboard/Employees.tsx'
import ExpensesPage from './pages/Dashboard/Expenses.tsx'
import FeedbackPage from './pages/Dashboard/Feedback.tsx'
import PosPage from './pages/Dashboard/Pos.tsx'
import ProductsPage from './pages/Dashboard/Products.tsx'
import ReportsPage from './pages/Dashboard/Reports.tsx'
import SuppliersPage from './pages/Dashboard/Suppliers.tsx'
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/Login" element={<h1>Login Page</h1>} />
          <Route path="/Dashboard" element={<DashboardPage/>} />
        <Route path="/Dashboard/Customer" element={<CustomerPage />} />
        <Route path="/Dashboard/Employees" element={<EmployeesPage />} />
        <Route path="/Dashboard/Expenses" element={<ExpensesPage />} />
        <Route path="/Dashboard/Feedback" element={<FeedbackPage />} />
        <Route path="/Dashboard/Pos" element={<PosPage />} />
        <Route path="/Dashboard/Products" element={<ProductsPage />} />
        <Route path="/Dashboard/Reports" element={<ReportsPage />} />
        <Route path="/Dashboard/Suppliers" element={<SuppliersPage />} />

        
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
