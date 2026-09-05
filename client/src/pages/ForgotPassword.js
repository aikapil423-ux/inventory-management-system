import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUser, FaPhone, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/password-reset', { username, mobile });
      toast.success(data.message, { duration: 6000 });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      padding: 16
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        width: '100%', maxWidth: 440, overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '32px 24px',
          textAlign: 'center', color: '#fff'
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            border: '3px solid #ef4444'
          }}>
            <FaShieldAlt size={36} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Forgot Password</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Haryana Police Inventory Management</p>
        </div>

        <div style={{ padding: '24px 24px 32px' }}>
          {!submitted ? (
            <>
              <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
                Enter your username and registered mobile number. Your request will be sent to the admin for approval. Once approved, your new password will be sent via SMS/WhatsApp.
              </p>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Username</label>
                  <div style={{ position: 'relative' }}>
                    <FaUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username" required
                      style={{
                        width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #d1d5db',
                        borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Mobile Number (10 digits)</label>
                  <div style={{ position: 'relative' }}>
                    <FaPhone style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit mobile number" required pattern="\d{10}" maxLength={10}
                      style={{
                        width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #d1d5db',
                        borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '12px', backgroundColor: loading ? '#94a3b8' : '#dc2626',
                  color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                  <FaPaperPlane /> {loading ? 'Submitting...' : 'Submit Reset Request'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', backgroundColor: '#dcfce7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                fontSize: 32, color: '#16a34a'
              }}>✓</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Request Submitted!</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 8 }}>
                Your password reset request has been sent to the admin for approval.
              </p>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
                Once approved, your new password will be sent to <strong>{mobile}</strong> via SMS/WhatsApp.
              </p>
              <div style={{ padding: 12, backgroundColor: '#fffbeb', borderRadius: 8, border: '1px solid #fef3c7', fontSize: 12, color: '#92400e', marginBottom: 20 }}>
                Please contact your administrator if you don't receive the password within 24 hours.
              </div>
            </div>
          )}

          <Link to="/login" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginTop: 16, padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, textDecoration: 'none', color: '#475569', fontSize: 13, fontWeight: 500
          }}>
            <FaArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
