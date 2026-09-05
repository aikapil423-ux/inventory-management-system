import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUser, FaEnvelope, FaPhone, FaLock, FaArrowLeft, FaIdBadge, FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Signup() {
  const [districts, setDistricts] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', phone: '', password: '', confirmPassword: '',
    role: '', designation: '', post: '', badgeNumber: '',
    district: '', policeStation: '', address: '', city: '', state: 'Haryana', pincode: ''
  });

  useEffect(() => {
    api.get('/districts/public').then(res => setDistricts(res.data.data || [])).catch((e) => {});
  }, []);

  useEffect(() => {
    if (form.district) {
      api.get(`/police-stations/public?district=${form.district}`).then(res => setPoliceStations(res.data.data || [])).catch(() => {});
    } else {
      setPoliceStations([]);
    }
  }, [form.district]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      const { data } = await api.post('/signup-requests', submitData);
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
        width: '100%', maxWidth: 600, overflow: 'hidden', maxHeight: '95vh', overflowY: 'auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '28px 24px',
          textAlign: 'center', color: '#fff'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
            border: '3px solid #2563eb'
          }}>
            <FaShieldAlt size={32} color="#2563eb" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>New Registration</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Haryana Police Inventory Management System</p>
        </div>

        <div style={{ padding: '24px 24px 32px' }}>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <SectionTitle title="Personal Information" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field icon={<FaUser />} label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="e.g. Rajesh Kumar" />
                <Field icon={<FaIdBadge />} label="Badge Number" name="badgeNumber" value={form.badgeNumber} onChange={handleChange} placeholder="e.g. HG-12345" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field icon={<FaEnvelope />} label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" />
                <Field icon={<FaPhone />} label="Mobile Number (10 digits)" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} required placeholder="9876543210" maxLength={10} />
              </div>

              <SectionTitle title="Account Details" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Role *</label>
                  <select name="role" value={form.role} onChange={handleChange} required style={inputStyle}>
                    <option value="">Select Role</option>
                    <option value="tsi">TSI (Town Station In-charge)</option>
                    <option value="mhc_storekeeper">MHC Store Keeper</option>
                    <option value="inspection_officer">Inspection Officer</option>
                    <option value="unit">Unit</option>
                  </select>
                </div>
                <Field label="Designation *" name="designation" value={form.designation} onChange={handleChange} required placeholder="e.g. Sub Inspector" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field label="Post / Station" name="post" value={form.post} onChange={handleChange} placeholder="e.g. PS Sadar" />
                <div></div>
              </div>

              <SectionTitle title="Login Credentials" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field icon={<FaUser />} label="Username" name="username" value={form.username} onChange={handleChange} required placeholder="Choose a username" />
                <div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field icon={<FaLock />} label="Password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" />
                <Field icon={<FaLock />} label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required placeholder="Re-enter password" />
              </div>

              <SectionTitle title="Location Details" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>District</label>
                  <select name="district" value={form.district} onChange={handleChange} style={inputStyle}>
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Police Station</label>
                  <select name="policeStation" value={form.policeStation} onChange={handleChange} style={inputStyle} disabled={!form.district}>
                    <option value="">Select Police Station</option>
                    {policeStations.map(ps => <option key={ps._id} value={ps._id}>{ps.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Full address" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                <Field icon={<FaBuilding />} label="City" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Karnal" />
                <Field label="State" name="state" value={form.state} onChange={handleChange} placeholder="Haryana" />
                <Field label="Pincode" name="pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="132001" maxLength={6} />
              </div>

              <div style={{ padding: 12, backgroundColor: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', marginBottom: 16 }}>
                <strong>Note:</strong> Your registration request will be sent to the admin for approval. Once approved, you can login with the username and password you set above.
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px', backgroundColor: loading ? '#94a3b8' : '#2563eb',
                color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}>
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', backgroundColor: '#dcfce7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                fontSize: 32, color: '#16a34a'
              }}>✓</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Registration Submitted!</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 16 }}>
                Your registration request has been sent to the admin for approval. Once approved, you can login with the username and password you set.
              </p>
              <div style={{ padding: 12, backgroundColor: '#fffbeb', borderRadius: 8, border: '1px solid #fef3c7', fontSize: 12, color: '#92400e', marginBottom: 20 }}>
                Please contact your administrator if your request is not approved within 24 hours.
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

const SectionTitle = ({ title }) => (
  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 10, marginTop: 8, paddingBottom: 6, borderBottom: '2px solid #e2e8f0' }}>{title}</div>
);

const Field = ({ icon, label, name, type = 'text', value, onChange, required, placeholder, maxLength }) => (
  <div>
    <label style={labelStyle}>{label} {required && '*'}</label>
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }}>{icon}</span>}
      <input
        type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} maxLength={maxLength}
        style={{ ...inputStyle, paddingLeft: icon ? 34 : 12 }}
      />
    </div>
  </div>
);

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 };
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none' };
