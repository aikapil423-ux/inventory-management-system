import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import NotificationBell from './NotificationBell';
import { FaTachometerAlt, FaBox, FaTags, FaExchangeAlt, FaClipboardList, FaSearch, FaFileAlt, FaUsers, FaSignOutAlt, FaBars, FaShieldAlt } from 'react-icons/fa';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, roles: ['super_admin', 'district_admin', 'tsi', 'mhc_storekeeper', 'inspection_officer', 'unit'] },
  { path: '/inventory', label: 'Inventory', icon: <FaBox />, roles: ['super_admin', 'district_admin', 'tsi', 'mhc_storekeeper', 'inspection_officer', 'unit'] },
  { path: '/items', label: 'Items', icon: <FaTags />, roles: ['super_admin', 'district_admin', 'tsi', 'mhc_storekeeper', 'inspection_officer', 'unit'] },
  { path: '/categories', label: 'Categories', icon: <FaTags />, roles: ['super_admin', 'district_admin', 'tsi', 'mhc_storekeeper', 'unit', 'inspection_officer'] },
  { path: '/transactions', label: 'Transactions', icon: <FaExchangeAlt />, roles: ['super_admin', 'district_admin', 'tsi', 'mhc_storekeeper', 'unit'] },
  { path: '/demands', label: 'Demands', icon: <FaClipboardList />, roles: ['super_admin', 'district_admin', 'tsi', 'mhc_storekeeper', 'unit'] },
  { path: '/inspections', label: 'Inspections', icon: <FaSearch />, roles: ['super_admin', 'inspection_officer', 'district_admin', 'tsi', 'mhc_storekeeper'] },
  { path: '/reports', label: 'Reports', icon: <FaFileAlt />, roles: ['super_admin', 'district_admin', 'tsi', 'mhc_storekeeper', 'inspection_officer', 'unit'] },
  { path: '/admin/users', label: 'User Management', icon: <FaUsers />, roles: ['super_admin', 'district_admin'] }
];

const roleLabels = {
  super_admin: 'Super Admin',
  district_admin: 'District Admin',
  tsi: 'TSI / PS In-charge',
  mhc_storekeeper: 'MHC Store Keeper',
  inspection_officer: 'Inspection Officer',
  unit: 'Unit'
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <aside style={{
        width: sidebarOpen ? 260 : 70, backgroundColor: '#0f172a', color: '#fff',
        transition: 'width 0.3s', display: 'flex', flexDirection: 'column', position: 'fixed',
        height: '100vh', zIndex: 50, overflow: 'hidden'
      }}>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #1e293b' }}>
          <FaShieldAlt size={28} color="#f59e0b" />
          {sidebarOpen && <div><div style={{ fontWeight: 700, fontSize: 14 }}>Haryana Police</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Inventory System</div></div>}
        </div>
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {filteredNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', textDecoration: 'none',
                color: isActive ? '#f59e0b' : '#cbd5e1', backgroundColor: isActive ? '#1e293b' : 'transparent',
                fontSize: 14, transition: 'all 0.2s', borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent'
              })}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 70, transition: 'margin-left 0.3s', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 60, backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#475569' }}>
              <FaBars />
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
              {filteredNav.find(item => window.location.pathname.startsWith(item.path))?.label || 'Dashboard'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NotificationBell />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{user?.fullName}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{roleLabels[user?.role]}</div>
            </div>
            <button onClick={handleLogout} style={{
              background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 13
            }}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
