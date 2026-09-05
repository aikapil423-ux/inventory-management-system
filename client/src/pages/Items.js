import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaThList, FaLayerGroup, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const conditionColors = { new: '#16a34a', good: '#2563eb', fair: '#f59e0b', poor: '#ea580c', damaged: '#dc2626' };

export default function Items() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [viewMode, setViewMode] = useState('category');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', category: '', description: '', unit: 'piece', minimumStock: 0, maximumStock: 0, reorderLevel: 0, unitPrice: 0, condition: 'new' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [itemRes, catRes] = await Promise.all([api.get('/items'), api.get('/categories')]);
      setItems(itemRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchSearch = !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !filterCategory || i.category?._id === filterCategory;
      const matchCondition = !filterCondition || i.condition === filterCondition;
      return matchSearch && matchCategory && matchCondition;
    });
  }, [items, searchTerm, filterCategory, filterCondition]);

  const groupedByCategory = useMemo(() => {
    const groups = {};
    filtered.forEach(item => {
      const catName = item.category?.name || 'Uncategorized';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(item);
    });
    return groups;
  }, [filtered]);

  const groupedByCondition = useMemo(() => {
    const groups = { new: [], good: [], fair: [], poor: [], damaged: [] };
    filtered.forEach(item => {
      if (groups[item.condition]) groups[item.condition].push(item);
      else groups.new.push(item);
    });
    return groups;
  }, [filtered]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) { await api.put(`/items/${editingItem._id}`, form); toast.success('Item updated'); }
      else { await api.post('/items', form); toast.success('Item created'); }
      setShowModal(false); setEditingItem(null);
      setForm({ name: '', code: '', category: '', description: '', unit: 'piece', minimumStock: 0, maximumStock: 0, reorderLevel: 0, unitPrice: 0, condition: 'new' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try { await api.delete(`/items/${id}`); toast.success('Item deleted'); loadData(); }
    catch (err) { toast.error('Failed to delete item'); }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, code: item.code, category: item.category?._id || '', description: item.description || '', unit: item.unit, minimumStock: item.minimumStock, maximumStock: item.maximumStock, reorderLevel: item.reorderLevel, unitPrice: item.unitPrice, condition: item.condition || 'new' });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: '', code: '', category: '', description: '', unit: 'piece', minimumStock: 0, maximumStock: 0, reorderLevel: 0, unitPrice: 0, condition: 'new' });
    setShowModal(true);
  };

  const renderCard = (item) => (
    <div key={item._id} style={{ backgroundColor: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{item.code}</span>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginTop: 6 }}>{item.name}</h4>
        </div>
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 500, backgroundColor: `${conditionColors[item.condition]}15`, color: conditionColors[item.condition], textTransform: 'capitalize' }}>{item.condition}</span>
      </div>
      {item.description && <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{item.description}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 10, color: '#64748b' }}>
        <span style={{ padding: '2px 6px', backgroundColor: '#f8fafc', borderRadius: 4 }}>{item.unit}</span>
        <span style={{ padding: '2px 6px', backgroundColor: '#f8fafc', borderRadius: 4 }}>Reorder: {item.reorderLevel}</span>
        {item.unitPrice > 0 && <span style={{ padding: '2px 6px', backgroundColor: '#f8fafc', borderRadius: 4 }}>₹{item.unitPrice}</span>}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
        <button onClick={() => openEdit(item)} style={{ flex: 1, padding: '6px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>Edit</button>
        <button onClick={() => handleDelete(item._id)} style={{ padding: '6px 10px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}><FaTrash /></button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Items Management</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{filtered.length} items</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setViewMode('category')} style={{ ...viewBtnStyle, backgroundColor: viewMode === 'category' ? '#2563eb' : '#fff', color: viewMode === 'category' ? '#fff' : '#475569' }}><FaLayerGroup /> Category</button>
          <button onClick={() => setViewMode('condition')} style={{ ...viewBtnStyle, backgroundColor: viewMode === 'condition' ? '#2563eb' : '#fff', color: viewMode === 'condition' ? '#fff' : '#475569' }}><FaFilter /> Condition</button>
          <button onClick={() => setViewMode('table')} style={{ ...viewBtnStyle, backgroundColor: viewMode === 'table' ? '#2563eb' : '#fff', color: viewMode === 'table' ? '#fff' : '#475569' }}><FaThList /> Table</button>
          <button onClick={openAdd} style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
            <FaPlus /> Add Item
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}>
          <option value="">All Conditions</option>
          {Object.keys(conditionColors).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div> : (
        <>
          {viewMode === 'category' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
              {Object.keys(groupedByCategory).length === 0 ? (
                <div style={{ gridColumn: '1 / -1', backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#94a3b8' }}>No items found</div>
              ) : Object.entries(groupedByCategory).map(([catName, catItems]) => {
                const catConds = {};
                catItems.forEach(i => { catConds[i.condition] = (catConds[i.condition] || 0) + 1; });
                return (
                  <div key={catName} style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', borderLeft: '4px solid #2563eb' }}>
                    <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{catName}</h3>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{catItems.length} items</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {Object.entries(catConds).map(([c, q]) => (
                          <span key={c} style={{ padding: '2px 6px', borderRadius: 10, fontSize: 9, fontWeight: 500, backgroundColor: `${conditionColors[c]}15`, color: conditionColors[c] }}>
                            {c.charAt(0).toUpperCase()}: {q}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                      {catItems.map(item => renderCard(item))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'condition' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
              {Object.entries(groupedByCondition).filter(([, items]) => items.length > 0).map(([cond, condItems]) => (
                <div key={cond} style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', borderLeft: `4px solid ${conditionColors[cond]}` }}>
                  <div style={{ padding: '12px 16px', backgroundColor: `${conditionColors[cond]}08`, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: conditionColors[cond], textTransform: 'capitalize' }}>{cond} Condition</h3>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{condItems.length} items</span>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${conditionColors[cond]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: conditionColors[cond] }}>{condItems.length}</div>
                  </div>
                  <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                    {condItems.map(item => renderCard(item))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'table' && (
            <div style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={thStyle}>Code</th><th style={thStyle}>Name</th><th style={thStyle}>Category</th>
                    <th style={thStyle}>Condition</th><th style={thStyle}>Unit</th><th style={thStyle}>Reorder</th><th style={thStyle}>Price</th><th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="8" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No items found</td></tr>
                  ) : filtered.map(item => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}><span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{item.code}</span></td>
                      <td style={tdStyle}><div style={{ fontWeight: 500 }}>{item.name}</div></td>
                      <td style={tdStyle}>{item.category?.name || '-'}</td>
                      <td style={tdStyle}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, backgroundColor: `${conditionColors[item.condition]}15`, color: conditionColors[item.condition], textTransform: 'capitalize' }}>{item.condition}</span></td>
                      <td style={tdStyle}>{item.unit}</td>
                      <td style={tdStyle}>{item.reorderLevel}</td>
                      <td style={tdStyle}>₹{item.unitPrice}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}><FaEdit /></button>
                          <button onClick={() => handleDelete(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 550, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{editingItem ? 'Edit Item' : 'Add Item'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Item Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} /></div>
                <div><label style={labelStyle}>Item Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required style={inputStyle}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Condition</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} style={inputStyle}>
                    {Object.entries(conditionColors).map(([c]) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} style={inputStyle}>
                    <option value="piece">Piece</option><option value="pair">Pair</option><option value="set">Set</option>
                    <option value="kg">Kg</option><option value="liter">Liter</option><option value="box">Box</option>
                  </select>
                </div>
                <div><label style={labelStyle}>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Min Stock</label><input type="number" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: Number(e.target.value) })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Max Stock</label><input type="number" value={form.maximumStock} onChange={(e) => setForm({ ...form, maximumStock: Number(e.target.value) })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Reorder Level</label><input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Unit Price (₹)</label><input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingItem(null); }} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>{editingItem ? 'Update' : 'Add'}</button>
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
