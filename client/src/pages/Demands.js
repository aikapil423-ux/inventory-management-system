import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { FaPlus, FaCheck, FaTimes, FaPaperPlane, FaEye, FaHistory, FaKey, FaPhone, FaUserPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const statusColors = { draft: '#64748b', submitted: '#f59e0b', approved: '#2563eb', fulfilled: '#16a34a', partially_fulfilled: '#0891b2', rejected: '#dc2626' };
const urgencyColors = { low: '#64748b', medium: '#f59e0b', high: '#ea580c', critical: '#dc2626' };
const resetStatusColors = { pending: '#f59e0b', approved: '#16a34a', rejected: '#dc2626' };
const tabStyle = { padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 };
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };
const primaryBtnStyle = { padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const cancelBtnStyle = { padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer', fontSize: 13 };
const iconBtnStyle = (color) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: `1px solid ${color}30`, borderRadius: 6, backgroundColor: `${color}10`, color, cursor: 'pointer', fontSize: 13 });

export default function Demands() {
  const { user } = useSelector(state => state.auth);
  const [demands, setDemands] = useState([]);
  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [form, setForm] = useState({ store: '', items: [{ item: '', quantity: 1, urgency: 'medium', reason: '' }], remarks: '' });
  const [resetRequests, setResetRequests] = useState([]);
  const [showRejectResetModal, setShowRejectResetModal] = useState(null);
  const [resetRejectionReason, setResetRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('demands');
  const [signupRequests, setSignupRequests] = useState([]);
  const [showRejectSignupModal, setShowRejectSignupModal] = useState(null);
  const [signupRejectionReason, setSignupRejectionReason] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [dRes, iRes, sRes] = await Promise.all([api.get('/demands'), api.get('/items'), api.get('/stores')]);
      setDemands(dRes.data.data); setItems(iRes.data.data); setStores(sRes.data.data);
      if (['super_admin', 'district_admin'].includes(user?.role)) {
        try { const rRes = await api.get('/password-reset'); setResetRequests(rRes.data.data); } catch (e) { /* ignore */ }
        try { const sRes = await api.get('/signup-requests'); setSignupRequests(sRes.data.data); } catch (e) { /* ignore */ }
      }
    } catch (err) { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const handleApproveReset = async (id) => {
    try { const { data } = await api.put(`/password-reset/${id}/approve`); toast.success(data.message, { duration: 6000 }); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleRejectReset = async () => {
    if (!resetRejectionReason.trim()) { toast.error('Please provide a reason'); return; }
    try { const { data } = await api.put(`/password-reset/${showRejectResetModal}/reject`, { rejectionReason: resetRejectionReason }); toast.success(data.message); setShowRejectResetModal(null); setResetRejectionReason(''); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleApproveSignup = async (id) => {
    try { const { data } = await api.put(`/signup-requests/${id}/approve`); toast.success(data.message, { duration: 6000 }); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleRejectSignup = async () => {
    if (!signupRejectionReason.trim()) { toast.error('Please provide a reason'); return; }
    try { const { data } = await api.put(`/signup-requests/${showRejectSignupModal}/reject`, { rejectionReason: signupRejectionReason }); toast.success(data.message); setShowRejectSignupModal(null); setSignupRejectionReason(''); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const loadDemandDetail = async (id) => {
    try { const { data } = await api.get(`/demands/${id}`); setShowDetail(data.data); }
    catch (err) { toast.error('Failed to load details'); }
  };
  const addItemRow = () => setForm({ ...form, items: [...form.items, { item: '', quantity: 1, urgency: 'medium', reason: '' }] });
  const removeItemRow = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItemRow = (idx, field, value) => { const updated = [...form.items]; updated[idx][field] = value; setForm({ ...form, items: updated }); };
  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post('/demands', form); toast.success('Demand created as draft'); setShowModal(false); setForm({ store: '', items: [{ item: '', quantity: 1, urgency: 'medium', reason: '' }], remarks: '' }); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleSubmit = async (id) => {
    try { const { data } = await api.put(`/demands/${id}/submit`); toast.success(data.message || 'Demand submitted', { duration: 4000 }); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleApprove = async (id) => {
    try { const { data } = await api.put(`/demands/${id}/approve`, { remarks: 'Approved' }); toast.success(data.message || 'Demand approved', { duration: 4000 }); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    try { const { data } = await api.put(`/demands/${showRejectModal}/reject`, { rejectionReason }); toast.error(data.message || 'Rejected', { duration: 5000 }); setShowRejectModal(null); setRejectionReason(''); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleFulfill = async (id) => {
    try { await api.put(`/demands/${id}/fulfill`); toast.success('Demand fulfilled'); loadData(); }
    catch (err) { toast.error('Failed'); }
  };

  const canApprove = (demand) => demand.status === 'submitted' && demand.sentTo?._id === user?._id;
  const canFulfill = (demand) => demand.status === 'approved' && ['super_admin', 'district_admin', 'mhc_storekeeper'].includes(user?.role);
  const isAdmin = ['super_admin', 'district_admin'].includes(user?.role);
  const pendingResets = resetRequests.filter(r => r.status === 'pending');
  const pendingSignups = signupRequests.filter(r => r.status === 'pending');

  const renderDemandsTab = () => (
    <>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {demands.length === 0 ? (
            <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#94a3b8' }}>No demands found</div>
          ) : demands.map(d => (
            <div key={d._id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: canApprove(d) ? '4px solid #f59e0b' : d.status === 'rejected' ? '4px solid #dc2626' : d.status === 'approved' ? '4px solid #2563eb' : '1px solid transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{d.demandNumber}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, backgroundColor: `${statusColors[d.status]}15`, color: statusColors[d.status], textTransform: 'capitalize' }}>{d.status?.replace(/_/g, ' ')}</span>
                    {d.items?.some(di => di.urgency === 'critical') && <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, backgroundColor: '#dc262620', color: '#dc2626', fontWeight: 600 }}>CRITICAL</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                    <strong>From:</strong> {d.requestedBy?.fullName} ({d.requestedBy?.role?.replace(/_/g, ' ')})
                    {d.store && <span> | <strong>Store:</strong> {d.store.name}</span>}
                    <span> | {new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                  {d.sentTo && <div style={{ fontSize: 12, color: '#2563eb', marginTop: 2 }}><strong>Sent to:</strong> {d.sentTo.fullName} ({d.sentTo.role?.replace(/_/g, ' ')}) for approval</div>}
                  {d.status === 'rejected' && d.rejectionReason && <div style={{ marginTop: 8, padding: 10, backgroundColor: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', fontSize: 12, color: '#dc2626' }}><strong>Rejection Reason:</strong> {d.rejectionReason}</div>}
                  {d.status === 'approved' && <div style={{ marginTop: 8, padding: 10, backgroundColor: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 12, color: '#2563eb' }}><strong>Approved by:</strong> {d.approvedBy?.fullName} on {new Date(d.approvedAt).toLocaleDateString()}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                  <button onClick={() => loadDemandDetail(d._id)} style={iconBtnStyle('#64748b')} title="View Details"><FaEye /></button>
                  {d.status === 'draft' && <button onClick={() => handleSubmit(d._id)} style={iconBtnStyle('#f59e0b')} title="Submit"><FaPaperPlane /></button>}
                  {d.status === 'rejected' && <button onClick={() => handleSubmit(d._id)} style={iconBtnStyle('#f59e0b')} title="Resubmit"><FaPaperPlane /></button>}
                  {canApprove(d) && <>
                    <button onClick={() => handleApprove(d._id)} style={iconBtnStyle('#16a34a')} title="Approve"><FaCheck /></button>
                    <button onClick={() => { setShowRejectModal(d._id); setRejectionReason(''); }} style={iconBtnStyle('#dc2626')} title="Reject"><FaTimes /></button>
                  </>}
                  {canFulfill(d) && <button onClick={() => handleFulfill(d._id)} style={iconBtnStyle('#2563eb')} title="Fulfilled"><FaCheck /></button>}
                </div>
              </div>
              {d.items?.length > 0 && (
                <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  {d.items.map((di, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', fontSize: 13 }}>
                      <span style={{ fontWeight: 500, color: '#334155' }}>{di.item?.name || 'Unknown Item'}</span>
                      <span style={{ color: '#64748b' }}>x{di.quantity} {di.item?.unit}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500, backgroundColor: `${urgencyColors[di.urgency]}15`, color: urgencyColors[di.urgency], textTransform: 'capitalize' }}>{di.urgency}</span>
                      {di.reason && <span style={{ color: '#94a3b8', fontSize: 12 }}>({di.reason})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderResetsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {resetRequests.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#94a3b8' }}><FaKey style={{ fontSize: 32, marginBottom: 12, color: '#cbd5e1' }} /><div>No password reset requests</div></div>
      ) : resetRequests.map(r => (
        <div key={r._id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: r.status === 'pending' ? '4px solid #f59e0b' : r.status === 'approved' ? '4px solid #16a34a' : '4px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <FaKey style={{ color: '#f59e0b' }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>Password Reset Request</span>
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, backgroundColor: `${resetStatusColors[r.status]}15`, color: resetStatusColors[r.status], textTransform: 'capitalize' }}>{r.status}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}><strong>User:</strong> {r.userId?.fullName || r.username} ({r.username})</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}><FaPhone style={{ display: 'inline', marginRight: 4 }} /><strong>Mobile:</strong> {r.mobile}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}><strong>Role:</strong> {r.userId?.role?.replace(/_/g, ' ') || 'N/A'} | <strong>Requested:</strong> {new Date(r.createdAt).toLocaleString()}</div>
              {r.status === 'approved' && r.newPassword && <div style={{ marginTop: 8, padding: 10, backgroundColor: '#dcfce7', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 12, color: '#166534' }}><strong>New Password:</strong> <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{r.newPassword}</code><br /><span style={{ fontSize: 11, color: '#15803d' }}>Sent via SMS/WhatsApp to {r.mobile}</span></div>}
              {r.status === 'rejected' && r.rejectionReason && <div style={{ marginTop: 8, padding: 10, backgroundColor: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', fontSize: 12, color: '#dc2626' }}><strong>Rejection Reason:</strong> {r.rejectionReason}</div>}
            </div>
            {r.status === 'pending' && (
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                <button onClick={() => handleApproveReset(r._id)} style={iconBtnStyle('#16a34a')} title="Approve"><FaCheck /></button>
                <button onClick={() => { setShowRejectResetModal(r._id); setResetRejectionReason(''); }} style={iconBtnStyle('#dc2626')} title="Reject"><FaTimes /></button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSignupsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {signupRequests.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#94a3b8' }}><FaUserPlus style={{ fontSize: 32, marginBottom: 12, color: '#cbd5e1' }} /><div>No signup requests</div></div>
      ) : signupRequests.map(r => (
        <div key={r._id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: r.status === 'pending' ? '4px solid #f59e0b' : r.status === 'approved' ? '4px solid #16a34a' : '4px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <FaUserPlus style={{ color: '#7c3aed' }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>Registration Request</span>
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, backgroundColor: `${resetStatusColors[r.status]}15`, color: resetStatusColors[r.status], textTransform: 'capitalize' }}>{r.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12, color: '#64748b' }}>
                <div><strong>Name:</strong> {r.fullName}</div>
                <div><strong>Username:</strong> {r.username}</div>
                <div><strong>Email:</strong> {r.email}</div>
                <div><strong>Phone:</strong> {r.phone}</div>
                <div><strong>Role:</strong> {r.role?.replace(/_/g, ' ')}</div>
                <div><strong>Designation:</strong> {r.designation}</div>
                {r.badgeNumber && <div><strong>Badge:</strong> {r.badgeNumber}</div>}
                {r.post && <div><strong>Post:</strong> {r.post}</div>}
                {r.district && <div><strong>District:</strong> {r.district?.name || '-'}</div>}
                {r.policeStation && <div><strong>PS:</strong> {r.policeStation?.name || '-'}</div>}
                {r.city && <div><strong>City:</strong> {r.city}</div>}
                {r.address && <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {r.address}</div>}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Requested: {new Date(r.createdAt).toLocaleString()}</div>
              {r.status === 'approved' && <div style={{ marginTop: 8, padding: 10, backgroundColor: '#dcfce7', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 12, color: '#166534' }}><strong>Account created!</strong> Username: <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{r.username}</code> - User can now login.</div>}
              {r.status === 'rejected' && r.rejectionReason && <div style={{ marginTop: 8, padding: 10, backgroundColor: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', fontSize: 12, color: '#dc2626' }}><strong>Rejection Reason:</strong> {r.rejectionReason}</div>}
            </div>
            {r.status === 'pending' && (
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                <button onClick={() => handleApproveSignup(r._id)} style={iconBtnStyle('#16a34a')} title="Approve"><FaCheck /></button>
                <button onClick={() => { setShowRejectSignupModal(r._id); setSignupRejectionReason(''); }} style={iconBtnStyle('#dc2626')} title="Reject"><FaTimes /></button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Demands</h1>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
          <FaPlus /> New Demand
        </button>
      </div>

      {isAdmin && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('demands')} style={{ ...tabStyle, backgroundColor: activeTab === 'demands' ? '#2563eb' : '#fff', color: activeTab === 'demands' ? '#fff' : '#475569' }}>Demands ({demands.length})</button>
          <button onClick={() => setActiveTab('resets')} style={{ ...tabStyle, backgroundColor: activeTab === 'resets' ? '#dc2626' : '#fff', color: activeTab === 'resets' ? '#fff' : '#475569', position: 'relative' }}>
            <FaKey /> Password Reset
            {pendingResets.length > 0 && <span style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingResets.length}</span>}
          </button>
          <button onClick={() => setActiveTab('signups')} style={{ ...tabStyle, backgroundColor: activeTab === 'signups' ? '#7c3aed' : '#fff', color: activeTab === 'signups' ? '#fff' : '#475569', position: 'relative' }}>
            <FaUserPlus /> Signup Requests
            {pendingSignups.length > 0 && <span style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingSignups.length}</span>}
          </button>
        </div>
      )}

      {activeTab === 'demands' && renderDemandsTab()}
      {activeTab === 'resets' && renderResetsTab()}
      {activeTab === 'signups' && renderSignupsTab()}

      {showModal && (
        <div style={overlayStyle}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Create Demand</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Store</label>
                <select value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} required style={inputStyle}>
                  <option value="">Select Store</option>{stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Items</label>
                  <button type="button" onClick={addItemRow} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 12 }}>+ Add Item</button>
                </div>
                {form.items.map((di, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                    <select value={di.item} onChange={(e) => updateItemRow(idx, 'item', e.target.value)} required style={inputStyle}>
                      <option value="">Select Item</option>{items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                    </select>
                    <input type="number" min="1" value={di.quantity} onChange={(e) => updateItemRow(idx, 'quantity', Number(e.target.value))} style={inputStyle} placeholder="Qty" />
                    <select value={di.urgency} onChange={(e) => updateItemRow(idx, 'urgency', e.target.value)} style={inputStyle}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                    </select>
                    <input value={di.reason} onChange={(e) => updateItemRow(idx, 'reason', e.target.value)} style={inputStyle} placeholder="Reason" />
                    {form.items.length > 1 && <button type="button" onClick={() => removeItemRow(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FaTimes /></button>}
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Remarks</label><textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} style={inputStyle} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={primaryBtnStyle}>Create Demand</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div style={overlayStyle}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 450 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#dc2626' }}>Reject Demand</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Please provide a reason for rejection.</p>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} placeholder="Enter rejection reason..." required style={{ ...inputStyle, borderColor: '#fecaca' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => { setShowRejectModal(null); setRejectionReason(''); }} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleReject} style={{ ...primaryBtnStyle, backgroundColor: '#dc2626' }}>Reject & Notify</button>
            </div>
          </div>
        </div>
      )}

      {showRejectResetModal && (
        <div style={overlayStyle}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 450 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#dc2626' }}>Reject Password Reset</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Please provide a reason.</p>
            <textarea value={resetRejectionReason} onChange={(e) => setResetRejectionReason(e.target.value)} rows={4} placeholder="Enter reason..." required style={{ ...inputStyle, borderColor: '#fecaca' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => { setShowRejectResetModal(null); setResetRejectionReason(''); }} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleRejectReset} style={{ ...primaryBtnStyle, backgroundColor: '#dc2626' }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {showRejectSignupModal && (
        <div style={overlayStyle}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 450 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#dc2626' }}>Reject Signup Request</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Please provide a reason.</p>
            <textarea value={signupRejectionReason} onChange={(e) => setSignupRejectionReason(e.target.value)} rows={4} placeholder="Enter reason..." required style={{ ...inputStyle, borderColor: '#fecaca' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => { setShowRejectSignupModal(null); setSignupRejectionReason(''); }} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleRejectSignup} style={{ ...primaryBtnStyle, backgroundColor: '#dc2626' }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <div style={overlayStyle}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 650, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>{showDetail.demandNumber}</h3>
              <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><span style={labelStyle}>Status</span><span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, backgroundColor: `${statusColors[showDetail.status]}15`, color: statusColors[showDetail.status], textTransform: 'capitalize' }}>{showDetail.status?.replace(/_/g, ' ')}</span></div>
              <div><span style={labelStyle}>Requested By</span><div style={{ fontSize: 13 }}>{showDetail.requestedBy?.fullName}</div></div>
              <div><span style={labelStyle}>Store</span><div style={{ fontSize: 13 }}>{showDetail.store?.name}</div></div>
              <div><span style={labelStyle}>Sent To</span><div style={{ fontSize: 13 }}>{showDetail.sentTo?.fullName || 'Not assigned'}</div></div>
            </div>
            {showDetail.items?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Items Requested</h4>
                {showDetail.items.map((di, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: 6, marginBottom: 4, fontSize: 13 }}>
                    <span>{di.item?.name}</span><span>x{di.quantity} | {di.urgency} {di.reason && `- ${di.reason}`}</span>
                  </div>
                ))}
              </div>
            )}
            {showDetail.history?.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><FaHistory /> Activity History</h4>
                {showDetail.history.map((h, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                    <div style={{ width: 80, flexShrink: 0, color: '#94a3b8' }}>{new Date(h.at).toLocaleDateString()}</div>
                    <div>
                      <span style={{ textTransform: 'capitalize', fontWeight: 500, color: h.action === 'rejected' ? '#dc2626' : h.action === 'approved' ? '#16a34a' : '#334155' }}>{h.action}</span>
                      {h.by && <span style={{ color: '#64748b' }}> by {h.by.fullName}</span>}
                      {h.remarks && <div style={{ color: '#64748b', marginTop: 2 }}>{h.remarks}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
