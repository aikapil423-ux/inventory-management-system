import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaPlus, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { labelStyle, inputStyle } from '../ui';

const statusColors = { satisfactory: '#16a34a', needs_attention: '#f59e0b', critical: '#dc2626' };

export default function Inspections() {
  const [inspections, setInspections] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ store: '', type: 'routine', findings: '', recommendations: '', items: [], inspectedAt: new Date().toISOString().split('T')[0] });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [iRes, sRes, itemRes] = await Promise.all([api.get('/inspections'), api.get('/stores'), api.get('/items')]);
      setInspections(iRes.data.data); setStores(sRes.data.data); setItems(itemRes.data.data);
    } catch (err) { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post('/inspections', form); toast.success('Inspection created'); setShowModal(false); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Inspections</h1>
        <button onClick={() => setShowModal(true)}
          style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
          <FaPlus /> New Inspection
        </button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {inspections.length === 0 ? (
            <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#94a3b8' }}>No inspections found</div>
          ) : inspections.map(insp => (
            <div key={insp._id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{insp.inspectionNumber}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, textTransform: 'capitalize', backgroundColor: '#eff6ff', color: '#2563eb' }}>{insp.type}</span>
                    {insp.overallStatus && <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, textTransform: 'replace', backgroundColor: `${statusColors[insp.overallStatus]}15`, color: statusColors[insp.overallStatus] }}>{insp.overallStatus?.replace(/_/g, ' ')}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Inspector: {insp.inspector?.fullName} | Store: {insp.store?.name} | {new Date(insp.inspectedAt).toLocaleDateString()}</div>
                  {insp.findings && <div style={{ fontSize: 13, color: '#334155', marginTop: 8 }}>{insp.findings}</div>}
                </div>
                <button onClick={() => setShowDetail(insp)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><FaEye /> View</button>
              </div>
              {insp.items?.length > 0 && (
                <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  <table style={{ width: '100%', fontSize: 12 }}>
                    <thead><tr style={{ color: '#64748b' }}><th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th><th style={{ textAlign: 'right', padding: '4px 0' }}>Expected</th><th style={{ textAlign: 'right', padding: '4px 0' }}>Actual</th><th style={{ textAlign: 'right', padding: '4px 0' }}>Discrepancy</th></tr></thead>
                    <tbody>{insp.items.map((ii, idx) => (
                      <tr key={idx}><td style={{ padding: '4px 0', color: '#334155' }}>{ii.item?.name}</td><td style={{ textAlign: 'right' }}>{ii.expectedQuantity}</td><td style={{ textAlign: 'right' }}>{ii.inspectedQuantity}</td><td style={{ textAlign: 'right', color: ii.discrepancy > 0 ? '#dc2626' : '#16a34a', fontWeight: 500 }}>{ii.discrepancy}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>New Inspection</h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={labelStyle}>Store</label>
                  <select value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} required style={inputStyle}>
                    <option value="">Select Store</option>{stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                    <option value="routine">Routine</option><option value="special">Special</option><option value="annual">Annual</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Inspection Date</label><input type="date" value={form.inspectedAt} onChange={(e) => setForm({ ...form, inspectedAt: e.target.value })} style={inputStyle} /></div>
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Findings</label><textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} rows={3} style={inputStyle} placeholder="Describe your findings..." /></div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Recommendations</label><textarea value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} rows={2} style={inputStyle} placeholder="Any recommendations..." /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Create Inspection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>{showDetail.inspectionNumber}</h3>
              <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><span style={labelStyle}>Inspector:</span> {showDetail.inspector?.fullName}</div>
              <div><span style={labelStyle}>Store:</span> {showDetail.store?.name}</div>
              <div><span style={labelStyle}>Type:</span> {showDetail.type}</div>
              <div><span style={labelStyle}>Date:</span> {new Date(showDetail.inspectedAt).toLocaleDateString()}</div>
            </div>
            {showDetail.findings && <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 500 }}>Findings:</span><p style={{ fontSize: 13, color: '#334155', marginTop: 4 }}>{showDetail.findings}</p></div>}
            {showDetail.recommendations && <div><span style={{ fontWeight: 500 }}>Recommendations:</span><p style={{ fontSize: 13, color: '#334155', marginTop: 4 }}>{showDetail.recommendations}</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}


