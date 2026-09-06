import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/slices/authSlice';
import Layout from './components/Layout';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Items = lazy(() => import('./pages/Items'));
const Categories = lazy(() => import('./pages/Categories'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Demands = lazy(() => import('./pages/Demands'));
const Inspections = lazy(() => import('./pages/Inspections'));
const Reports = lazy(() => import('./pages/Reports'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Signup = lazy(() => import('./pages/Signup'));

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

function Page({ children }) {
  return <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px', fontSize: 15, color: '#666' }}>Loading...</div>}>{children}</Suspense>;
}

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    if (token) dispatch(loadUser());
  }, [dispatch, token]);

  const R = (path, el) => <Route key={path} path={path} element={<Page>{el}</Page>} />;

  return (
    <Routes>
      {R('/login', <Login />)}
      {R('/forgot-password', <ForgotPassword />)}
      {R('/signup', <Signup />)}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        {R('dashboard', <Dashboard />)}
        {R('inventory', <Inventory />)}
        {R('items', <Items />)}
        {R('categories', <Categories />)}
        {R('transactions', <Transactions />)}
        {R('demands', <Demands />)}
        {R('inspections', <Inspections />)}
        {R('reports', <Reports />)}
        <Route path="admin/users" element={<AdminRoute><Page><UserManagement /></Page></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}