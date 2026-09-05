import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaFileAlt, FaChartBar, FaClipboardList, FaHistory, FaArrowUp } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#7c3aed', '#0891b2', '#ea580c', '#64748b'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('summary');
  const [stockSummary, setStockSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [demandRanking, setDemandRanking] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReport(activeTab); }, [activeTab]);

  const loadReport = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'summary') {
        const { data } = await api.get('/reports/stock-summary');
        setStockSummary(data.data);
      } else if (tab === 'category') {
        const { data } = await api.get('/reports/category-breakdown');
        setCategoryBreakdown(data.data);
      } else if (tab === 'demand') {
        const { data } = await api.get('/reports/demand-ranking');
        setDemandRanking(data.data);
      } else if (tab === 'audit') {
        const { data } = await api.get('/reports/audit-trail');
        setAuditTrail(data.data);
      } else if (tab === 'forecast') {
        const { data } = await api.get('/reports/forecast');
        setForecast(data.data);
      }
    } catch (err) { toast.error('Failed to load report'); }
    setLoading(false);
  };

  const tabs = [
    { id: 'summary', label: 'Stock Summary', icon: <FaChartBar /> },
    { id: 'category', label: 'Category Breakdown', icon: <FaChartBar /> },
    { id: 'demand', label: 'Demand Ranking', icon: <FaClipboardList /> },
    { id: 'audit', label: 'Audit Trail', icon: <FaHistory /> },
    { id: 'forecast', label: 'Forecast', icon: <FaArrowUp /> }
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>Reports & Analytics</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
              backgroundColor: activeTab === tab.id ? '#2563eb' : '#fff',
              color: activeTab === tab.id ? '#fff' : '#475569',
              fontWeight: activeTab === tab.id ? 600 : 400
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading report...</div> : (
        <>
          {activeTab === 'summary' && stockSummary && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Total Records', value: stockSummary.totalItems, color: '#2563eb' },
                  { label: 'Total Quantity', value: stockSummary.totalQuantity, color: '#16a34a' },
                  { label: 'Low Stock', value: stockSummary.lowStockCount, color: '#f59e0b' },
                  { label: 'Out of Stock', value: stockSummary.outOfStock, color: '#ef4444' }
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${s.color}` }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {categoryBreakdown.length > 0 && (
                <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Stock by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalQuantity" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeTab === 'category' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {categoryBreakdown.map((cat, i) => (
                <div key={i} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600 }}>{cat.category}</h3>
                      <p style={{ fontSize: 12, color: '#64748b' }}>{cat.code}</p>
                    </div>
                    <span style={{ fontSize: 24, fontWeight: 700, color: COLORS[i % COLORS.length] }}>{cat.totalQuantity}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                    <div style={{ color: '#64748b' }}>Items: <strong>{cat.totalItems}</strong></div>
                    <div style={{ color: '#64748b' }}>Value: <strong>₹{cat.totalValue?.toLocaleString()}</strong></div>
                  </div>
                  {cat.conditions && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      {Object.entries(cat.conditions).map(([cond, qty]) => qty > 0 && (
                        <span key={cond} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, backgroundColor: '#f1f5f9', color: '#475569' }}>{cond}: {qty}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'demand' && (
            <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Most Demanded Items</h3>
              {demandRanking.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No demand data available</div> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demandRanking.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalDemand" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Audit Trail</h3>
              {auditTrail.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No audit records</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {auditTrail.slice(0, 50).map(log => (
                    <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>{log.user?.fullName}</span>
                        <span style={{ color: '#64748b' }}> {log.action}d </span>
                        <span style={{ fontWeight: 500 }}>{log.entity}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'forecast' && (
            <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Demand Forecast (30-day)</h3>
              {forecast.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No usage data available for forecasting</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={thStyle}>Item</th><th style={thStyle}>Code</th><th style={thStyle}>Total Issued</th>
                      <th style={thStyle}>Avg Daily</th><th style={thStyle}>Projected Monthly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((f, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{f.name}</td>
                        <td style={tdStyle}>{f.code}</td>
                        <td style={tdStyle}>{f.totalIssued}</td>
                        <td style={tdStyle}>{f.avgDailyUsage}</td>
                        <td style={tdStyle}><strong>{f.projectedMonthly}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', fontSize: 13, color: '#334155' };
