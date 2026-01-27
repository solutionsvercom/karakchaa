import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DashboardPage from './pages/Dashboard/Dashboard.tsx'
import CustomerPage from './pages/Dashboard/Customers.tsx'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/Login" element={<h1>Login Page</h1>} />
          <Route path="/Dashboard" element={<DashboardPage/>} />
        <Route path="/Dashboard/Customer" element={<CustomerPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
