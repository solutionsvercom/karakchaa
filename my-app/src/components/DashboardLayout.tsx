import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';

const DashboardLayout: React.FC = () => {
  const location = useLocation();

  // Get part after /Dashboard (Pos, Products, etc.) for title
  const raw = location.pathname.split('/')[2] || 'Dashboard';
  const pageTitle = raw
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="kb-shell">
      {/* Left sidebar, full height */}
      <Sidebar />

      {/* Right side: navbar on top of content */}
      <div className="kb-main">
        <Navbar pageTitle={pageTitle} />
        <main className="kb-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;