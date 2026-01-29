import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Get part after /Dashboard (Pos, Products, etc.) for title
  const raw = location.pathname.split('/')[2] || 'Dashboard';
  const pageTitle = raw
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  React.useEffect(() => {
    // Mobile UX: close the drawer after navigation changes.
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={`kb-shell ${isSidebarOpen ? 'kb-shell--sidebar-open' : ''}`}>
      {/* Left sidebar, full height */}
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
        onNavigate={() => setIsSidebarOpen(false)}
      />

      {/* Mobile-only backdrop (CSS controls visibility) */}
      <button
        type="button"
        className="kb-sidebar-backdrop"
        aria-label="Close sidebar"
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Right side: navbar on top of content */}
      <div className="kb-main">
        <Navbar pageTitle={pageTitle} onMenuClick={() => setIsSidebarOpen((v) => !v)} />
        <main className="kb-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;