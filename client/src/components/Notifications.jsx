import React, { useEffect, useState } from 'react';
import API from '../services/api';
import BackToTop from './BackToTop';

const NAVY = '#0f172a';
const GOLD = '#d4af37';

const TYPE_META = {
  inquiry_reply: { icon: '📬', label: 'Inquiry', color: '#d4af37', view: 'messages' },
  new_inquiry: { icon: '✉️', label: 'Inquiry', color: '#d4af37', view: 'messages' },
  new_booking: { icon: '🧳', label: 'Booking', color: '#1e3a5f', view: 'bookings' },
  booking_update: { icon: '🧳', label: 'Booking', color: '#1e3a5f', view: 'bookings' },
  system: { icon: '🔔', label: 'System', color: '#64748b', view: null },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'inquiry', label: 'Inquiries' },
  { key: 'booking', label: 'Bookings' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getToken = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Notifications({ onNavigate, isAdmin = false }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/notifications', { headers: getToken() });
      setNotifications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`, {}, { headers: getToken() });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as read.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch('/notifications/read-all', {}, { headers: getToken() });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all as read.');
    }
  };

  const clearAll = async () => {
    try {
      await API.patch('/notifications/clear-all', {}, { headers: getToken() });
      setNotifications([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear notifications.');
    }
  };

  const handleNotificationClick = (n) => {
    const meta = TYPE_META[n.type] || TYPE_META.system;
    if (!n.isRead) markAsRead(n._id);
    if (!meta.view || !onNavigate) return;

    if (isAdmin) {
      if (n.type === 'inquiry_reply' || n.type === 'new_inquiry') {
        onNavigate('admin', 'inquiries');
      } else if (n.type === 'new_booking' || n.type === 'booking_update') {
        onNavigate('admin', 'reservations');
      }
    } else {
      onNavigate(meta.view);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'inquiry') return n.type === 'inquiry_reply' || n.type === 'new_inquiry';
    if (filter === 'booking') return n.type === 'new_booking' || n.type === 'booking_update';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="main-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="container py-5" style={{ maxWidth: '900px' }}>
        <div className="text-center mb-4 animate-slide-up">
          <span
            className="badge mb-3 px-3 py-2 fw-bold text-uppercase rounded-pill"
            style={{ background: 'rgba(212,175,55,0.2)', color: GOLD, border: '1px solid rgba(212,175,55,0.4)' }}
          >
            Notifications
          </span>
          <h1 className="display-5 fw-bold" style={{ color: NAVY }}>Notifications Hub</h1>
          <p className="text-muted">Stay updated on your inquiries, bookings, and concierge responses.</p>
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div className="d-flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`btn rounded-pill fw-bold ${filter === f.key ? 'active' : ''}`}
                style={{
                  background: filter === f.key ? GOLD : 'rgba(255,255,255,0.85)',
                  color: filter === f.key ? NAVY : NAVY,
                  border: `1px solid ${filter === f.key ? GOLD : 'rgba(15,23,42,0.15)'}`,
                  padding: '6px 18px',
                  fontSize: '0.9rem',
                }}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn rounded-pill fw-bold"
              style={{
                background: 'rgba(212,175,55,0.12)',
                color: GOLD,
                border: '1px solid rgba(212,175,55,0.4)',
                padding: '6px 16px',
                fontSize: '0.85rem',
              }}
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All as Read
            </button>
            <button
              className="btn rounded-pill fw-bold"
              style={{
                background: 'rgba(220,53,69,0.1)',
                color: '#dc3545',
                border: '1px solid rgba(220,53,69,0.3)',
                padding: '6px 16px',
                fontSize: '0.85rem',
              }}
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger text-center rounded-3">{error}</div>
        )}

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: GOLD }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading notifications...</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div
            className="text-center py-5 rounded-4 animate-fade-in"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212,175,55,0.25)',
            }}
          >
            <div className="fs-1 mb-3">🔔</div>
            <h5 className="fw-bold" style={{ color: NAVY }}>No notifications</h5>
            <p className="text-muted">
              {filter === 'unread' ? "You're all caught up!" : 'New alerts will appear here.'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              return (
                <div
                  key={n._id}
                  className={`d-flex align-items-start gap-3 p-4 rounded-4 animate-fade-in ${n.isRead ? '' : 'unread-card'}`}
                  style={{
                    background: n.isRead ? 'rgba(15,23,42,0.72)' : 'rgba(15,23,42,0.92)',
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${n.isRead ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.5)'}`,
                    boxShadow: n.isRead ? 'none' : '0 8px 24px rgba(212,175,55,0.15)',
                    cursor: meta.view ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: `${meta.color}22`,
                      fontSize: '1.4rem',
                    }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <h6 className="mb-0 fw-bold" style={{ color: '#FFFFFF' }}>{n.title}</h6>
                      {!n.isRead && (
                        <span
                          style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: GOLD, flexShrink: 0,
                          }}
                        />
                      )}
                      <small className="ms-auto" style={{ color: '#94A3B8' }}>{formatDate(n.createdAt)}</small>
                    </div>
                    <p className="mb-2" style={{ color: n.isRead ? '#CBD5E1' : '#F1F5F9' }}>{n.message}</p>
                    <div className="d-flex align-items-center gap-3">
                      <span
                        className="badge rounded-pill px-2 py-1"
                        style={{
                          background: `${meta.color}22`,
                          color: meta.color,
                          fontSize: '0.75rem',
                        }}
                      >
                        {meta.label}
                      </span>
                      {!n.isRead && (
                        <button
                          className="btn btn-sm rounded-pill fw-bold"
                          style={{
                            background: 'transparent',
                            color: GOLD,
                            border: '1px solid rgba(212,175,55,0.4)',
                            padding: '3px 12px',
                            fontSize: '0.78rem',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n._id);
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BackToTop />
    </div>
  );
}
