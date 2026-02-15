import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/Store';
import { logout } from '../../features/AuthSlice';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  Store,
  Users,
  Wallet,
  Truck,
  UserCog,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { ROLE_ACCESS } from "../../config/RoleConfig";

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', key: 'dashboard', icon: <LayoutDashboard size={16} /> },
  { label: 'Point of Sale', path: '/dashboard/pos', key: 'pos', icon: <ShoppingCart size={16} /> },
  { label: 'Products', path: '/dashboard/products', key: 'products', icon: <Package size={16} /> },
  { label: 'Sales', path: '/dashboard/sales', key: 'sales', icon: <TrendingUp size={16} /> },
  { label: 'Stock Management', path: '/dashboard/stockmanagement', key: 'stockmanagement', icon: <Store size={16} /> },
  { label: 'Customers', path: '/dashboard/customer', key: 'customers', icon: <Users size={16} /> },
  { label: 'Expenses', path: '/dashboard/expenses', key: 'expenses', icon: <Wallet size={16} /> },
  { label: 'Suppliers', path: '/dashboard/suppliers', key: 'suppliers', icon: <Truck size={16} /> },
  { label: 'Employees', path: '/dashboard/employees', key: 'employees', icon: <UserCog size={16} /> },
  { label: 'Reports', path: '/dashboard/reports', key: 'reports', icon: <BarChart3 size={16} /> },
];


type SidebarProps = {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  isCollapsed, 
  onToggleCollapse, 
  onNavigate 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

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
        {menuItems
  .filter(item =>
    user?.role &&
    ROLE_ACCESS[user.role as keyof typeof ROLE_ACCESS]?.includes(item.key)
  )
  .map((item) => {


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

      {/* User Section with Logout Above */}
      <div className="kb-sidebar-user" ref={dropdownRef} style={{ position: 'relative' }}>
        {/* Logout Dropdown - ABOVE USER */}
        {isDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '12px',
              right: '12px',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
              borderRadius: '12px',
              overflow: 'hidden',
              zIndex: 1000,
              boxShadow: '0 -4px 16px rgba(255, 107, 107, 0.3)',
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                all: 'unset',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.paddingLeft = '20px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.paddingLeft = '16px';
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* User Button */}
        <button
          className="kb-sidebar-user-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            all: 'unset',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            boxSizing: 'border-box',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div className="kb-sidebar-user-avatar">{getUserInitials()}</div>
          <div className="kb-sidebar-user-text" style={{ flex: 1 }}>
            <div className="kb-sidebar-user-name">{user?.name || 'User'}</div>
            <div className="kb-sidebar-user-role" style={{ textTransform: 'capitalize' }}>
              {user?.role || 'Staff'}
            </div>
          </div>
          <ChevronDown 
            size={16} 
            style={{ 
              transition: 'transform 0.2s',
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'rgba(255, 255, 255, 0.7)',
            }} 
          />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;