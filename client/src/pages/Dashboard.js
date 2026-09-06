import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { FaBox, FaExclamationTriangle, FaExchangeAlt, FaArrowDown, FaArrowUp, FaCheckCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { conditionColors } from '../ui';

const PIE_COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#ea580c', '#dc2626'];

const StatCard = ({ icon, label, value, color, subtext }) => (
  <div style={{
    backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex', alignItems: 'center', gap: 16, borderLeft: `4px solid ${color}`
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12, backgroundColor: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 22
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
      {subtext && <div style={{ fontSize: 11, color: subtext.color || '#64748b' }}>{subtext.text}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [conditionData, setConditionData] = useState([]);
  const [categoryItems, setCategoryItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [invRes, txRes, lowRes] = await Promise.all([
        api.get('/reports/stock-summary').catch(() => ({ data: { data: { totalItems: 0, totalQuantity: 0, lowStockCount: 0, outOfStock: 0, inventory: [] } } })),
        api.get('/transactions?status=completed').catch(() => ({ data: { data: [] } })),
        api.get('/items/low-stock').catch(() => ({ data: { data: [] } }))
      ]);

      setStats(invRes.data.data);
      setRecentTransactions(txRes.data.data?.slice(0, 5) || []);
      setLowStockItems(lowRes.data.data?.slice(0, 5) || []);

      const catRes = await api.get('/reports/category-breakdown').catch(() => ({ data: { data: [] } }));
      setChartData(catRes.data.data || []);

      const inventory = invRes.data.data?.inventory || [];

      const condCounts = { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 };
      inventory.forEach(inv => { if (condCounts[inv.condition] !== undefined) condCounts[inv.condition] += inv.quantity; });
      setConditionData(Object.entries(condCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })));

      const grouped = {};
      inventory.forEach(inv => {
        const catName = inv.item?.category?.name || inv.item?.category || 'Uncategorized';
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(inv);
      });
      setCategoryItems(grouped);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Welcome, {user?.fullName}</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{user?.role?.replace(/_/g, ' ').toUpperCase()} Dashboard</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<FaBox />} label="Total Items" value={stats?.totalQuantity || 0} color="#2563eb" subtext={{ text: `${stats?.totalItems || 0} records` }} />
        <StatCard icon={<FaExclamationTriangle />} label="Low Stock Alerts" value={stats?.lowStockCount || 0} color="#f59e0b" />
        <StatCard icon={<FaArrowDown />} label="Out of Stock" value={stats?.outOfStock || 0} color="#ef4444" />
        <StatCard icon={<FaCheckCircle />} label="Good Condition" value={(conditionData.find(c => c.name === 'good')?.value || 0) + (conditionData.find(c => c.name === 'new')?.value || 0)} color="#16a34a" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Category Breakdown</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalQuantity" name="Quantity" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalItems" name="Item Types" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13 }}>No data available</div>
          )}
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Condition Breakdown</h3>
          {conditionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={conditionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {conditionData.map((entry, idx) => (
                    <Cell key={idx} fill={conditionColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} units`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13 }}>No condition data</div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            {conditionData.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: conditionColors[c.name] }} />
                <span style={{ textTransform: 'capitalize', color: '#475569' }}>{c.name}: {c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Items by Category</h3>
        {Object.keys(categoryItems).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
            {Object.entries(categoryItems).map(([catName, items]) => (
              <div key={catName} style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{catName}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{items.length} items | {items.reduce((s, i) => s + i.quantity, 0)} units</span>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {items.map(inv => (
                    <div key={inv._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid #f8fafc', fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 500, color: '#334155' }}>{inv.item?.name}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{inv.item?.code}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500, backgroundColor: `${conditionColors[inv.condition]}15`, color: conditionColors[inv.condition], textTransform: 'capitalize' }}>{inv.condition}</span>
                        <span style={{ fontWeight: 600, color: '#1e293b', minWidth: 30, textAlign: 'right' }}>{inv.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13 }}>No inventory items</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Low Stock Items</h3>
          {lowStockItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lowStockItems.map(item => (
                <div key={item._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', backgroundColor: '#fffbeb', borderRadius: 8, border: '1px solid #fef3c7'
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#b45309' }}>{item.code} | {item.category?.name || 'Uncategorized'}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '4px 8px', backgroundColor: '#f59e0b', color: '#fff', borderRadius: 4 }}>Reorder</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13 }}>All stock levels OK</div>
          )}
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Recent Transactions</h3>
          {recentTransactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentTransactions.map(tx => (
                <div key={tx._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: 8
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{tx.transactionNumber}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{tx.item?.name} - {tx.quantity} units</div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '4px 8px', borderRadius: 4,
                    backgroundColor: tx.type === 'receive' ? '#dcfce7' : tx.type === 'issue' ? '#fef2f2' : '#dbeafe',
                    color: tx.type === 'receive' ? '#16a34a' : tx.type === 'issue' ? '#dc2626' : '#2563eb'
                  }}>
                    {tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13 }}>No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
