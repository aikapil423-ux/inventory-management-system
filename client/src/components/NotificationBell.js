import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaTrash, FaTimes } from 'react-icons/fa';
import api from '../services/api';

const typeIcons = {
  demand_submitted: { color: '#f59e0b', bg: '#fef3c7' },
  demand_approved: { color: '#16a34a', bg: '#dcfce7' },
  demand_rejected: { color: '#dc2626', bg: '#fef2f2' },
  demand_fulfilled: { color: '#2563eb', bg: '#dbeafe' },
  transaction_completed: { color: '#0891b2', bg: '#cffafe' },
  low_stock: { color: '#ea580c', bg: '#fff7ed' },
  general: { color: '#64748b', bg: '#f1f5f9' }
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (err) { }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { }
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (!notifications.find(n => n._id === id)?.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        position: 'relative', background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
        padding: '8px 10px', cursor: 'pointer', color: '#475569', fontSize: 18
      }}>
        <FaBell />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', color: '#fff',
            borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 380, maxHeight: 480,
          backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0', zIndex: 200, overflow: 'hidden'
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 12 }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No notifications</div>
            ) : notifications.map(n => {
              const style = typeIcons[n.type] || typeIcons.general;
              return (
                <div key={n._id} onClick={() => !n.isRead && markRead(n._id)} style={{
                  padding: '12px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                  backgroundColor: n.isRead ? '#fff' : '#f8fafc', transition: 'background 0.2s',
                  display: 'flex', gap: 12, alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, backgroundColor: style.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14
                  }}>
                    {n.type?.includes('approved') ? <FaCheck color={style.color} /> : n.type?.includes('rejected') ? <FaTimes color={style.color} /> : <FaBell color={style.color} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: '#1e293b', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <button onClick={(e) => deleteNotif(n._id, e)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4
                  }}><FaTrash size={11} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
