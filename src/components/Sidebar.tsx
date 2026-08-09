import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Package, BarChart2,
  FileText, LogOut, Menu, X, Zap
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard />, label: 'Dashboard', roles: null },
    { to: '/customers', icon: <Users />, label: 'Customers', roles: null },
    { to: '/products', icon: <Package />, label: 'Products', roles: null },
    { to: '/inventory', icon: <BarChart2 />, label: 'Inventory', roles: null },
    { to: '/challans', icon: <FileText />, label: 'Challans', roles: null },
  ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="btn btn-ghost btn-icon"
        style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 300, display: 'none' }}
        onClick={() => setMobileOpen(o => !o)}
        id="sidebar-toggle"
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Zap size={18} color="white" /></div>
          <div>
            <h1>ERP Portal</h1>
            <span>Operations System</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(item => (
            (!item.roles || (item.roles && hasRole(...(item.roles as string[])))) && (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                {item.label}
              </NavLink>
            )
          ))}
        </nav>

        {/* User info */}
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <p>{user?.name}</p>
              <span>{user?.role}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={handleLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
