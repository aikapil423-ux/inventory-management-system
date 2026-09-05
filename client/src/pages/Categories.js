import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', icon: 'folder' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try { const { data } = await api.get('/categories'); setCategories(data.data); }
    catch (err) { toast.error('Failed to load categories'); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) { await api.put(`/categories/${editingCat._id}`, form); toast.success('Category updated'); }
      else { await api.post('/categories', form); toast.success('Category created'); }
      setShowModal(false); setEditingCat(null); setForm({ name: '', code: '', description: '', icon: 'folder' });
      loadCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await api.delete(`/categories/${id}`); toast.success('Category deleted'); loadCategories(); }
    catch (err) { toast.error('Failed to delete category'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Categories</h1>
        <button onClick={() => { setEditingCat(null); setForm({ name: '', code: '', description: '', icon: 'folder' }); setShowModal(true); }}
          style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
          <FaPlus /> Add Category
        </button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {categories.map(cat => (
            <div key={cat._id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{cat.code}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>{cat.name}</h3>
                  {cat.description && <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{cat.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditingCat(cat); setForm({ name: cat.name, code: cat.code, description: cat.description || '', icon: cat.icon || 'folder' }); setShowModal(true); }}
                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#2563eb' }}><FaEdit size={12} /></button>
                  <button onClick={() => handleDelete(cat._id)}
                    style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#ef4444' }}><FaTrash size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 450 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{editingCat ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} /></div>
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required style={inputStyle} placeholder="e.g., RG, CM" /></div>
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={inputStyle} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingCat(null); }} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>{editingCat ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };
