import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/slices/authSlice';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Items from './pages/Items';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
import Demands from './pages/Demands';
import Inspections from './pages/Inspections';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import ForgotPassword from './pages/ForgotPassword';
import Signup from './pages/Signup';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 18 }}>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useSelector(state => state.auth);
  if (!user || !['super_admin', 'district_admin'].includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    if (token) dispatch(loadUser());
  }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="items" element={<Items />} />
        <Route path="categories" element={<Categories />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="demands" element={<Demands />} />
        <Route path="inspections" element={<Inspections />} />
        <Route path="reports" element={<Reports />} />
        <Route path="admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
