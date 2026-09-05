import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { FaSearch, FaPlus, FaEdit, FaThList, FaLayerGroup } from 'react-icons/fa';
import toast from 'react-hot-toast';

const conditionColors = { new: '#16a34a', good: '#2563eb', fair: '#f59e0b', poor: '#ea580c', damaged: '#dc2626' };

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState('category');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({ store: '', item: '', quantity: 0, condition: 'new', batchNumber: '', location: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [invRes, itemRes, storeRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/items'),
        api.get('/stores')
      ]);
      setInventory(invRes.data.data);
      setItems(itemRes.data.data);
      setStores(storeRes.data.data);
    } catch (err) { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return inventory.filter(inv => {
      const matchSearch = !searchTerm || inv.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || inv.item?.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCondition = !filterCondition || inv.condition === filterCondition;
      const matchCategory = !filterCategory || inv.item?.category?._id === filterCategory || inv.item?.category === filterCategory;
      return matchSearch && matchCondition && matchCategory;
    });
  }, [inventory, searchTerm, filterCondition, filterCategory]);

  const groupedByCategory = useMemo(() => {
    const groups = {};
    filtered.forEach(inv => {
      const catName = inv.item?.category?.name || 'Uncategorized';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(inv);
    });
    return groups;
  }, [filtered]);

  const groupedByCondition = useMemo(() => {
    const groups = { new: [], good: [], fair: [], poor: [], damaged: [] };
    filtered.forEach(inv => {
      if (groups[inv.condition]) groups[inv.condition].push(inv);
      else groups.good.push(inv);
    });
    return groups;
  }, [filtered]);

  const categories = useMemo(() => {
    const cats = {};
    items.forEach(i => { if (i.category?.name) cats[i.category._id] = i.category.name; });
    return Object.entries(cats).map(([id, name]) => ({ id, name }));
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await api.put(`/inventory/${editingRecord._id}`, form);
        toast.success('Inventory updated');
      } else {
        await api.post('/inventory', form);
        toast.success('Inventory added');
      }
      setShowModal(false);
      setEditingRecord(null);
      setForm({ store: '', item: '', quantity: 0, condition: 'new', batchNumber: '', location: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const openEdit = (inv) => {
    setEditingRecord(inv);
    setForm({ store: inv.store?._id || '', item: inv.item?._id || '', quantity: inv.quantity, condition: inv.condition, batchNumber: inv.batchNumber || '', location: inv.location || '' });
    setShowModal(true);
  };

  const condSummary = useMemo(() => {
    const sum = { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 };
    filtered.forEach(inv => { if (sum[inv.condition] !== undefined) sum[inv.condition] += inv.quantity; });
    return sum;
  }, [filtered]);

  const totalQty = filtered.reduce((s, i) => s + i.quantity, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Inventory Management</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{filtered.length} records | {totalQty} total units</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setViewMode('category')} style={{ ...viewBtnStyle, backgroundColor: viewMode === 'category' ? '#2563eb' : '#fff', color: viewMode === 'category' ? '#fff' : '#475569' }}><FaLayerGroup /> Category</button>
          <button onClick={() => setViewMode('condition')} style={{ ...viewBtnStyle, backgroundColor: viewMode === 'condition' ? '#2563eb' : '#fff', color: viewMode === 'condition' ? '#fff' : '#475569' }}><FaThList /> Condition</button>
          <button onClick={() => setViewMode('table')} style={{ ...viewBtnStyle, backgroundColor: viewMode === 'table' ? '#2563eb' : '#fff', color: viewMode === 'table' ? '#fff' : '#475569' }}><FaThList /> Table</button>
          <button onClick={() => { setEditingRecord(null); setForm({ store: '', item: '', quantity: 0, condition: 'new', batchNumber: '', location: '' }); setShowModal(true); }}
            style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
            <FaPlus /> Add
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input placeholder="Search by item name or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}>
          <option value="">All Conditions</option>
          {Object.entries(condSummary).map(([c, q]) => q > 0 && <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)} ({q})</option>)}
        </select>
      </div>

      {viewMode === 'category' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {Object.keys(groupedByCategory).length === 0 ? (
            <div style={{ gridColumn: '1 / -1', backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#94a3b8' }}>No inventory records found</div>
          ) : Object.entries(groupedByCategory).map(([catName, catItems]) => {
            const catQty = catItems.reduce((s, i) => s + i.quantity, 0);
            const catConds = {};
            catItems.forEach(i => { catConds[i.condition] = (catConds[i.condition] || 0) + i.quantity; });
            return (
              <div key={catName} style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', borderLeft: '4px solid #2563eb' }}>
                <div style={{ padding: '14px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{catName}</h3>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{catItems.length} records | {catQty} units</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {Object.entries(catConds).map(([c, q]) => (
                      <span key={c} style={{ padding: '2px 6px', borderRadius: 10, fontSize: 9, fontWeight: 500, backgroundColor: `${conditionColors[c]}15`, color: conditionColors[c] }}>
                        {c.charAt(0).toUpperCase()}: {q}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {catItems.map(inv => (
                    <div key={inv._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #f8fafc' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{inv.item?.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{inv.item?.code} | {inv.store?.name}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500, backgroundColor: `${conditionColors[inv.condition]}15`, color: conditionColors[inv.condition], textTransform: 'capitalize' }}>{inv.condition}</span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', minWidth: 35, textAlign: 'right' }}>{inv.quantity}</span>
                        <button onClick={() => openEdit(inv)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: '#2563eb', fontSize: 11 }}><FaEdit /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'condition' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {Object.entries(groupedByCondition).filter(([, items]) => items.length > 0).map(([cond, condItems]) => {
            const condQty = condItems.reduce((s, i) => s + i.quantity, 0);
            return (
              <div key={cond} style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', borderLeft: `4px solid ${conditionColors[cond]}` }}>
                <div style={{ padding: '14px 16px', backgroundColor: `${conditionColors[cond]}08`, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: conditionColors[cond], textTransform: 'capitalize' }}>{cond} Condition</h3>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{condItems.length} records | {condQty} units</span>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: `${conditionColors[cond]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: conditionColors[cond] }}>{condQty}</div>
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {condItems.map(inv => (
                    <div key={inv._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #f8fafc' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{inv.item?.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{inv.item?.code} | {inv.store?.name}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{inv.item?.category?.name || 'Uncategorized'}</span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', minWidth: 35, textAlign: 'right' }}>{inv.quantity}</span>
                        <button onClick={() => openEdit(inv)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: '#2563eb', fontSize: 11 }}><FaEdit /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'table' && (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={thStyle}>Item</th><th style={thStyle}>Category</th><th style={thStyle}>Store</th>
                <th style={thStyle}>Qty</th><th style={thStyle}>Condition</th><th style={thStyle}>Batch</th><th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No inventory records found</td></tr>
              ) : filtered.map(inv => (
                <tr key={inv._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}><div style={{ fontWeight: 500 }}>{inv.item?.name}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{inv.item?.code}</div></td>
                  <td style={tdStyle}>{inv.item?.category?.name || '-'}</td>
                  <td style={tdStyle}>{inv.store?.name}</td>
                  <td style={tdStyle}><span style={{ fontWeight: 700 }}>{inv.quantity}</span> <span style={{ fontSize: 11, color: '#94a3b8' }}>{inv.item?.unit}</span></td>
                  <td style={tdStyle}><span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, backgroundColor: `${conditionColors[inv.condition]}15`, color: conditionColors[inv.condition] }}>{inv.condition}</span></td>
                  <td style={tdStyle}>{inv.batchNumber || '-'}</td>
                  <td style={tdStyle}><button onClick={() => openEdit(inv)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}><FaEdit /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{editingRecord ? 'Edit Inventory' : 'Add Inventory'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Store</label>
                <select value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} required style={inputStyle}>
                  <option value="">Select Store</option>
                  {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Item</label>
                <select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} required style={inputStyle}>
                  <option value="">Select Item</option>
                  {items.map(i => <option key={i._id} value={i._id}>{i.name} ({i.code})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Quantity</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required style={inputStyle} /></div>
                <div><label style={labelStyle}>Condition</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} style={inputStyle}>
                    {Object.entries(conditionColors).map(([c]) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div><label style={labelStyle}>Batch Number</label><input value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingRecord(null); }} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>{editingRecord ? 'Update' : 'Add'}</button>
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
const viewBtnStyle = { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 };
