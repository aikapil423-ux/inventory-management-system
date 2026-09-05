import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../redux/slices/authSlice';
import { FaShieldAlt, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      padding: 16
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        width: '100%', maxWidth: 420, overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '32px 24px',
          textAlign: 'center', color: '#fff'
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            border: '3px solid #f59e0b'
          }}>
            <FaShieldAlt size={36} color="#f59e0b" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Haryana Police</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Inventory Management System</p>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Malkhana Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px 24px 32px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', textAlign: 'center', marginBottom: 20 }}>Sign In</h2>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Username</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username" required
                style={{
                  width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #d1d5db',
                  borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required
                style={{
                  width: '100%', padding: '10px 40px 10px 40px', border: '1px solid #d1d5db',
                  borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'
              }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', backgroundColor: loading ? '#94a3b8' : '#0f172a',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s'
          }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: '#dc2626', textDecoration: 'none', fontWeight: 500 }}>
              Forgot Password?
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Don't have an account? </span>
            <Link to="/signup" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              Sign Up
            </Link>
          </div>

          <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Demo Credentials:</p>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.8 }}>
              <div><strong>Super Admin:</strong> admin / admin123</div>
              <div><strong>District Admin:</strong> districtadmin / admin123</div>
              <div><strong>TSI:</strong> tsi / tsi123</div>
              <div><strong>Store Keeper:</strong> storekeeper / mhc123</div>
              <div><strong>Inspector:</strong> inspector / insp123</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
