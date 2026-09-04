import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';
import { useNewOrderAlert } from '../hooks/useNewOrderAlert';
import { playNewOrderSound, unlockAudioOnUserGesture } from '../utils/playNotificationSound';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { audioReady, alertToast, setAlertToast } = useNewOrderAlert();

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
        {!audioReady && (
          <button
            type="button"
            onClick={async () => {
              const enabled = await unlockAudioOnUserGesture();
              if (enabled) {
                void playNewOrderSound();
              }
            }}
            style={{
              width: "100%",
              border: "none",
              background: "#1E3A8A",
              color: "white",
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Bell size={16} />
            Click here to enable the new-order ringtone
          </button>
        )}
        {alertToast && (
          <div
            role="status"
            style={{
              position: "fixed",
              top: 86,
              right: 22,
              zIndex: 900,
              background: "#14532D",
              color: "white",
              border: "1px solid #22C55E",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              maxWidth: 320,
              cursor: "pointer",
            }}
            onClick={() => {
              void unlockAudioOnUserGesture();
              setAlertToast("");
            }}
          >
            <Bell size={16} />
            {alertToast}
          </div>
        )}
        <main className="kb-content">
          <React.Suspense fallback={
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                border: "3px solid var(--gray-4)", borderTopColor: "var(--accent-9)",
                animation: "spin 1s linear infinite"
              }} />
            </div>
          }>
            <Outlet />
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;