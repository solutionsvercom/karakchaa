import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';

import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/Dashboard/Dashboard.tsx';
import CustomerPage from './pages/Dashboard/Customers.tsx';
import EmployeesPage from './pages/Dashboard/Employees.tsx';
import ExpensesPage from './pages/Dashboard/Expenses.tsx';
import FeedbackPage from './pages/Dashboard/Feedback.tsx';
import PosPage from './pages/Dashboard/Pos.tsx';
import ProductsPage from './pages/Dashboard/Products.tsx';
import ReportsPage from './pages/Dashboard/Reports.tsx';
import SalesPage from './pages/Dashboard/Sales.tsx';
import StockmanagementPage from './pages/Dashboard/Stockmanagement.tsx';
import SuppliersPage from './pages/Dashboard/Suppliers.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Start on Dashboard */}
        <Route path="/" element={<Navigate to="/Dashboard" />} />

        <Route path="/Login" element={<h1>Login Page</h1>} />

        {/* Dashboard shell with nested pages */}
        <Route path="/Dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />        {/* /Dashboard */}
          <Route path="Customer" element={<CustomerPage />} />
          <Route path="Employees" element={<EmployeesPage />} />
          <Route path="Expenses" element={<ExpensesPage />} />
          <Route path="Feedback" element={<FeedbackPage />} />
          <Route path="Pos" element={<PosPage />} />
          <Route path="Products" element={<ProductsPage />} />
          <Route path="Reports" element={<ReportsPage />} />
          <Route path="Sales" element={<SalesPage />} />
          <Route path="Stockmanagement" element={<StockmanagementPage />} />
          <Route path="Suppliers" element={<SuppliersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;