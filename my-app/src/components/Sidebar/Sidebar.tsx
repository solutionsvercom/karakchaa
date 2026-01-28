import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  Boxes,
  Users,
  Receipt,
  Truck,
  UserCog,
  Store,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";


const menuItems = [
  { label: 'Dashboard', path: '/Dashboard', icon: <LayoutDashboard size={16} /> },
  { label: 'Point of Sale', path: '/Dashboard/Pos', icon: <ShoppingCart size={16} /> },
  { label: 'Products', path: '/Dashboard/Products', icon: <Package size={16} /> },
  { label: 'Sales', path: '/Dashboard/Sales', icon: <TrendingUp size={16} /> },
  { label: 'Stock Management', path: '/Dashboard/Stockmanagement', icon: <Store size={16} /> },

  { label: 'Customers', path: '/Dashboard/Customer', icon: <Users size={16} /> },
  { label: 'Expenses', path: '/Dashboard/Expenses', icon: <Wallet size={16} /> },
  { label: 'Suppliers', path: '/Dashboard/Suppliers', icon: <Truck size={16} /> },
  { label: 'Employees', path: '/Dashboard/Employees', icon: <UserCog size={16} /> },
];

type SidebarProps = {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onToggleCollapse, onNavigate }) => {
  const location = useLocation();

  return (
    <aside
      className={`kb-sidebar ${isOpen ? 'is-open' : ''} ${isCollapsed ? 'kb-sidebar--collapsed' : ''}`}
    >
      <div className="kb-sidebar-header">
        <div className="kb-sidebar-header-left">
          <div className="kb-sidebar-logo-circle">K</div>
          <div className="kb-sidebar-header-text">
            <div className="kb-sidebar-brand">Karakchaa</div>
            <div className="kb-sidebar-subtitle">Franchise MIS</div>
          </div>
        </div>

        <button
          type="button"
          className="kb-sidebar-collapse"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="kb-sidebar-menu">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              title={item.label}
              className={`kb-sidebar-item ${active ? 'kb-sidebar-item-active' : ''}`}
            >
              <span className="kb-sidebar-icon">{item.icon}</span>
              <span className="kb-sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="kb-sidebar-user">
        <div className="kb-sidebar-user-avatar">U</div>
        <div className="kb-sidebar-user-text">
          <div className="kb-sidebar-user-name">User</div>
          <div className="kb-sidebar-user-role">Staff</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;