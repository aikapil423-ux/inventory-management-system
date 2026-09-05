import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaUserCheck, FaUserSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const roleColors = { super_admin: '#dc2626', district_admin: '#2563eb', tsi: '#7c3aed', mhc_storekeeper: '#16a34a', inspection_officer: '#0891b2', unit: '#64748b' };
const roleLabels = { super_admin: 'Super Admin', district_admin: 'District Admin', tsi: 'TSI', mhc_storekeeper: 'MHC Store Keeper', inspection_officer: 'Inspection Officer', unit: 'Unit' };

export default function UserManagement() {
  const { user } = useSelector(state => state.auth);
  const [users, setUsers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', role: 'mhc_storekeeper', district: '', policeStation: '', store: '', phone: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [uRes, dRes, psRes, sRes] = await Promise.all([api.get('/users'), api.get('/districts'), api.get('/police-stations'), api.get('/stores')]);
      setUsers(uRes.data.data); setDistricts(dRes.data.data); setPoliceStations(psRes.data.data); setStores(sRes.data.data);
    } catch (err) { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.password && editingUser) delete payload.password;
      if (editingUser) { await api.put(`/users/${editingUser._id}`, payload); toast.success('User updated'); }
      else { await api.post('/users', payload); toast.success('User created'); }
      setShowModal(false); setEditingUser(null);
      setForm({ username: '', email: '', password: '', fullName: '', role: 'mhc_storekeeper', district: '', policeStation: '', store: '', phone: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('User deleted'); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleToggleStatus = async (id) => {
    try { await api.put(`/users/${id}/status`); toast.success('User status toggled'); loadData(); }
    catch (err) { toast.error('Failed to toggle status'); }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ username: u.username, email: u.email, password: '', fullName: u.fullName, role: u.role, district: u.district?._id || '', policeStation: u.policeStation?._id || '', store: u.store?._id || '', phone: u.phone || '' });
    setShowModal(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>User Management</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{user?.role === 'district_admin' ? 'Manage users in your district' : 'Manage all system users'}</p>
        </div>
        <button onClick={() => { setEditingUser(null); setForm({ username: '', email: '', password: '', fullName: '', role: 'mhc_storekeeper', district: user?.role === 'district_admin' ? user.district?._id || '' : '', policeStation: '', store: '', phone: '' }); setShowModal(true); }}
          style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
          <FaPlus /> Add User
        </button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div> : (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={thStyle}>Name</th><th style={thStyle}>Username</th><th style={thStyle}>Role</th>
                <th style={thStyle}>District</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500 }}>{u.fullName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{u.email}</div>
                  </td>
                  <td style={tdStyle}>{u.username}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, backgroundColor: `${roleColors[u.role]}15`, color: roleColors[u.role] }}>
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td style={tdStyle}>{u.district?.name || '-'}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, backgroundColor: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#16a34a' : '#dc2626' }}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(u)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#2563eb' }}><FaEdit size={12} /></button>
                      <button onClick={() => handleToggleStatus(u._id)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#f59e0b' }}>
                        {u.isActive ? <FaUserSlash size={12} /> : <FaUserCheck size={12} />}
                      </button>
                      {u.role !== 'super_admin' && <button onClick={() => handleDelete(u._id)} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#ef4444' }}><FaTrash size={12} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 550, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{editingUser ? 'Edit User' : 'Add User'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required style={inputStyle} /></div>
                <div><label style={labelStyle}>Username</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required style={inputStyle} disabled={!!editingUser} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} /></div>
                <div><label style={labelStyle}>Password {editingUser && '(leave blank to keep)'}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingUser} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                    {(user?.role === 'super_admin' ? ['super_admin', 'district_admin', 'tsi', 'mhc_storekeeper', 'inspection_officer', 'unit'] : ['tsi', 'mhc_storekeeper', 'unit']).map(r => (
                      <option key={r} value={r}>{roleLabels[r]}</option>
                    ))}
                  </select>
                </div>
                <div><label style={labelStyle}>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>District</label>
                  <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} style={inputStyle} disabled={user?.role === 'district_admin'}>
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Police Station</label>
                  <select value={form.policeStation} onChange={(e) => setForm({ ...form, policeStation: e.target.value })} style={inputStyle}>
                    <option value="">Select PS</option>
                    {policeStations.filter(ps => !form.district || ps.district?._id === form.district || ps.district === form.district).map(ps => (
                      <option key={ps._id} value={ps._id}>{ps.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Store (for MHC Keeper)</label>
                <select value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} style={inputStyle}>
                  <option value="">Select Store</option>
                  {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingUser(null); }} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>{editingUser ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '12px 16px', fontSize: 13, color: '#334155' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };
