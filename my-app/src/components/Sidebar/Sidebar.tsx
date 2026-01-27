import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', path: '/Dashboard', icon: '▢' },
  { label: 'Point of Sale', path: '/Dashboard/Pos', icon: '🛒' },
  { label: 'Products', path: '/Dashboard/Products', icon: '📦' },
  { label: 'Sales', path: '/Dashboard/Sales', icon: '₹' },
  { label: 'Stock Management', path: '/Dashboard/Stockmanagement', icon: '📊' },
  { label: 'Customers', path: '/Dashboard/Customer', icon: '👥' },
  { label: 'Expenses', path: '/Dashboard/Expenses', icon: '💸' },
  { label: 'Suppliers', path: '/Dashboard/Suppliers', icon: '🚚' },
  { label: 'Employees', path: '/Dashboard/Employees', icon: '🧑‍💼' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="kb-sidebar">
      <div className="kb-sidebar-header">
        <div className="kb-sidebar-logo-circle">K</div>
        <div>
          <div className="kb-sidebar-brand">Karakchaa</div>
          <div className="kb-sidebar-subtitle">Franchise MIS</div>
        </div>
      </div>

      <nav className="kb-sidebar-menu">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`kb-sidebar-item ${active ? 'kb-sidebar-item-active' : ''}`}
            >
              <span className="kb-sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="kb-sidebar-user">
        <div className="kb-sidebar-user-avatar">U</div>
        <div>
          <div className="kb-sidebar-user-name">User</div>
          <div className="kb-sidebar-user-role">Staff</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;