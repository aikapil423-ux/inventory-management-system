import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaSearch, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { thStyle, tdStyle, labelStyle, inputStyle } from '../ui';

const typeColors = { receive: '#16a34a', issue: '#dc2626', return: '#2563eb', transfer: '#7c3aed', damage: '#ea580c', disposal: '#64748b', adjustment: '#0891b2' };
const statusColors = { pending: '#f59e0b', approved: '#2563eb', completed: '#16a34a', rejected: '#dc2626', cancelled: '#64748b' };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'receive', item: '', toStore: '', fromStore: '', quantity: 1, condition: 'new', reason: '', issuedTo: { name: '', designation: '', badgeNumber: '' }, remarks: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [txRes, itemRes, storeRes] = await Promise.all([api.get('/transactions'), api.get('/items'), api.get('/stores')]);
      setTransactions(txRes.data.data); setItems(itemRes.data.data); setStores(storeRes.data.data);
    } catch (err) { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const filtered = transactions.filter(tx => {
    if (filterType && tx.type !== filterType) return false;
    if (filterStatus && tx.status !== filterStatus) return false;
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (form.type === 'issue') { payload.fromStore = form.fromStore; }
      if (form.type === 'receive') { payload.toStore = form.toStore; }
      if (form.type === 'return') { payload.toStore = form.toStore; }
      if (form.type === 'transfer') { payload.fromStore = form.fromStore; payload.toStore = form.toStore; }
      await api.post('/transactions', payload);
      toast.success('Transaction created'); setShowModal(false);
      setForm({ type: 'receive', item: '', toStore: '', fromStore: '', quantity: 1, condition: 'new', reason: '', issuedTo: { name: '', designation: '', badgeNumber: '' }, remarks: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Transaction failed'); }
  };

  const handleApprove = async (id) => {
    try { await api.put(`/transactions/${id}/approve`); toast.success('Transaction approved'); loadData(); }
    catch (err) { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    const remarks = prompt('Rejection reason:');
    if (!remarks) return;
    try { await api.put(`/transactions/${id}/reject`, { remarks }); toast.success('Transaction rejected'); loadData(); }
    catch (err) { toast.error('Failed to reject'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Transactions</h1>
        <button onClick={() => setShowModal(true)}
          style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
          <FaPlus /> New Transaction
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}>
          <option value="">All Types</option>
          <option value="receive">Receive</option><option value="issue">Issue</option><option value="return">Return</option>
          <option value="transfer">Transfer</option><option value="damage">Damage</option><option value="disposal">Disposal</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option><option value="approved">Approved</option><option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div> : (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={thStyle}>Txn #</th><th style={thStyle}>Type</th><th style={thStyle}>Item</th>
                <th style={thStyle}>Qty</th><th style={thStyle}>From</th><th style={thStyle}>To</th>
                <th style={thStyle}>Status</th><th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No transactions found</td></tr>
              ) : filtered.map(tx => (
                <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}><span style={{ fontSize: 12, fontWeight: 500 }}>{tx.transactionNumber}</span></td>
                  <td style={tdStyle}><span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, backgroundColor: `${typeColors[tx.type]}15`, color: typeColors[tx.type], textTransform: 'capitalize' }}>{tx.type}</span></td>
                  <td style={tdStyle}>{tx.item?.name}</td>
                  <td style={tdStyle}>{tx.quantity} {tx.item?.unit}</td>
                  <td style={tdStyle}>{tx.fromStore?.name || '-'}</td>
                  <td style={tdStyle}>{tx.toStore?.name || '-'}</td>
                  <td style={tdStyle}><span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, backgroundColor: `${statusColors[tx.status]}15`, color: statusColors[tx.status], textTransform: 'capitalize' }}>{tx.status}</span></td>
                  <td style={tdStyle}>
                    {tx.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleApprove(tx._id)} style={{ background: 'none', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#16a34a' }}><FaCheck size={12} /></button>
                        <button onClick={() => handleReject(tx._id)} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#ef4444' }}><FaTimes size={12} /></button>
                      </div>
                    )}
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
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>New Transaction</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Transaction Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                    <option value="receive">Receive</option><option value="issue">Issue</option><option value="return">Return</option>
                    <option value="transfer">Transfer</option><option value="damage">Damage</option>
                  </select>
                </div>
                <div><label style={labelStyle}>Item</label>
                  <select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} required style={inputStyle}>
                    <option value="">Select Item</option>{items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                  </select>
                </div>
              </div>
              {(form.type === 'issue' || form.type === 'transfer') && (
                <div style={{ marginBottom: 12 }}><label style={labelStyle}>From Store</label>
                  <select value={form.fromStore} onChange={(e) => setForm({ ...form, fromStore: e.target.value })} required style={inputStyle}>
                    <option value="">Select Store</option>{stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              {(form.type === 'receive' || form.type === 'return' || form.type === 'transfer') && (
                <div style={{ marginBottom: 12 }}><label style={labelStyle}>To Store</label>
                  <select value={form.toStore} onChange={(e) => setForm({ ...form, toStore: e.target.value })} required style={inputStyle}>
                    <option value="">Select Store</option>{stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Quantity</label><input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required style={inputStyle} /></div>
                <div><label style={labelStyle}>Condition</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} style={inputStyle}>
                    <option value="new">New</option><option value="good">Good</option><option value="fair">Fair</option>
                    <option value="poor">Poor</option><option value="damaged">Damaged</option>
                  </select>
                </div>
              </div>
              {form.type === 'issue' && (
                <div style={{ marginBottom: 12, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, color: '#374151' }}>Issued To:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <input placeholder="Name" value={form.issuedTo.name} onChange={(e) => setForm({ ...form, issuedTo: { ...form.issuedTo, name: e.target.value } })} style={inputStyle} />
                    <input placeholder="Designation" value={form.issuedTo.designation} onChange={(e) => setForm({ ...form, issuedTo: { ...form.issuedTo, designation: e.target.value } })} style={inputStyle} />
                    <input placeholder="Badge #" value={form.issuedTo.badgeNumber} onChange={(e) => setForm({ ...form, issuedTo: { ...form.issuedTo, badgeNumber: e.target.value } })} style={inputStyle} />
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Reason / Remarks</label><textarea value={form.reason || form.remarks} onChange={(e) => setForm({ ...form, reason: e.target.value, remarks: e.target.value })} rows={2} style={inputStyle} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Create Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
