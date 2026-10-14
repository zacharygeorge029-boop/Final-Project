import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';
import API from '../services/api';

const PRESET_AVATAR = 'https://api.dicebear.com/7.x/lorelei/svg?seed=Capipisa1&backgroundColor=d4af37';

const getToken = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const TYPE_META = {
  inquiry_reply: { icon: '📬' },
  new_inquiry: { icon: '✉️' },
  new_booking: { icon: '🧳' },
  booking_update: { icon: '🧳' },
  system: { icon: '🔔' },
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function Navbar({ user, onLogout, setCurrentView, currentView }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasReplied, setHasReplied] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const drawerRef = useRef(null);
  const toggleRef = useRef(null);
  const bellRef = useRef(null);
  const notifRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user || isAdmin) {
      setHasReplied(false);
      return;
    }
    let cancelled = false;
    const checkReplies = async () => {
      try {
        const res = await API.get('/inquiries/my-inquiries', { headers: getToken() });
        if (!cancelled) {
          setHasReplied(res.data.some((i) => i.status === 'replied'));
        }
      } catch (e) {
        // silent
      }
    };
    checkReplies();
    return () => { cancelled = true; };
  }, [user, isAdmin, currentView]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    let cancelled = false;
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/notifications', { headers: getToken() });
        if (!cancelled) {
          setNotifications(res.data);
        }
      } catch (e) {
        // silent
      }
    };
    fetchNotifications();
    return () => { cancelled = true; };
  }, [user, currentView]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target) &&
          toggleRef.current && !toggleRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target) &&
          bellRef.current && !bellRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [drawerOpen, notifOpen]);

  const handleNavigate = (view, tab) => {
    setCurrentView(view, tab);
    setDrawerOpen(false);
    setNotifOpen(false);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    setNotifOpen(false);
    onLogout();
  };

  const markNotificationRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`, {}, { headers: getToken() });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      // silent
    }
  };

  const handleNotifClick = (n) => {
    if (!n.isRead) markNotificationRead(n._id);
    setNotifOpen(false);
    if (n.type === 'inquiry_reply' || n.type === 'new_inquiry') {
      handleNavigate(isAdmin ? 'admin' : 'messages', isAdmin ? 'inquiries' : undefined);
    } else if (n.type === 'new_booking' || n.type === 'booking_update') {
      handleNavigate(isAdmin ? 'admin' : 'bookings', isAdmin ? 'reservations' : undefined);
    } else {
      handleNavigate('notifications');
    }
  };

  const avatarUrl = user?.avatar || PRESET_AVATAR;
  const displayName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Guest';
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 5);

  const BellButton = () => (
    <button
      ref={bellRef}
      className="navbar-bell-btn"
      onClick={() => { setNotifOpen((p) => !p); setDrawerOpen(false); }}
      aria-label="Notifications"
    >
      <span className="navbar-bell-icon">🔔</span>
      {unreadCount > 0 && (
        <span className="navbar-bell-badge">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );

  const NotificationDropdown = () => (
    <div className="notification-dropdown" ref={notifRef}>
      <div className="notification-dropdown-header">
        <span className="fw-bold">Notifications</span>
        {unreadCount > 0 && (
          <button
            className="notification-mark-all"
            onClick={async () => {
              try {
                await API.patch('/notifications/read-all', {}, { headers: getToken() });
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
              } catch (e) { /* silent */ }
            }}
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="notification-dropdown-list">
        {recentNotifications.length === 0 && (
          <div className="notification-empty">
            <div className="fs-4 mb-2">🔔</div>
            <small className="text-muted">No notifications yet.</small>
          </div>
        )}
        {recentNotifications.map((n) => {
          const meta = TYPE_META[n.type] || TYPE_META.system;
          return (
            <div
              key={n._id}
              className={`notification-item ${n.isRead ? '' : 'unread'}`}
              onClick={() => handleNotifClick(n)}
            >
              <div className="notification-icon">{meta.icon}</div>
              <div className="notification-content flex-grow-1 min-w-0">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold notification-title">{n.title}</span>
                  {!n.isRead && <span className="notification-dot" />}
                </div>
                <small className="notification-message">{n.message}</small>
                <small className="notification-time">{formatTimeAgo(n.createdAt)}</small>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="notification-dropdown-footer"
        onClick={() => handleNavigate('notifications')}
      >
        View All Notifications
      </div>
    </div>
  );

  return (
    <nav className="custom-navbar animate-fade-in">
      <span className="navbar-brand-custom" onClick={() => handleNavigate(isAdmin ? 'admin' : 'home')}>
        <img src={logo} alt="Capipisa Bay Resort & Hotel" className="navbar-logo" />
        <span className="navbar-brand-text">Capipisa Bay Resort & Hotel</span>
      </span>

      <div className="navbar-center">
        {/* Center intentionally left empty */}
      </div>

      <div className={`navbar-right ${user ? 'logged-in' : ''}`}>
        {isAdmin ? (
          <div className="d-flex align-items-center" style={{ gap: '16px' }}>
            <button
              className={`nav-link-btn admin-dashboard-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavigate('admin')}
            >
              👑 Admin Dashboard
            </button>
            <span className="welcome-admin-text">Welcome, Admin</span>
            <div style={{ position: 'relative' }}>
              <BellButton />
              {notifOpen && <NotificationDropdown />}
            </div>
            <button
              className="navbar-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : user ? (
          <div className="d-flex align-items-center" style={{ gap: '12px' }}>
            <button
              className={`nav-link-btn ${currentView === 'rooms' ? 'active' : ''}`}
              onClick={() => handleNavigate('rooms')}
            >
              Rooms & Suites
            </button>
            <button
              className={`nav-link-btn ${currentView === 'contact' ? 'active' : ''}`}
              onClick={() => handleNavigate('contact')}
            >
              Contact Us
            </button>
            <div style={{ position: 'relative' }}>
              <BellButton />
              {notifOpen && <NotificationDropdown />}
            </div>
            <button
              ref={toggleRef}
              className="navbar-avatar-btn"
              onClick={() => { setDrawerOpen((p) => !p); setNotifOpen(false); }}
              aria-label="Open menu"
            >
              <img src={avatarUrl} alt="User avatar" className="navbar-avatar-img" />
              <span className="navbar-hamburger">☰</span>
            </button>
          </div>
        ) : (
          <div className="d-flex align-items-center" style={{ gap: '12px' }}>
            <button
              className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => handleNavigate('home')}
            >
              Home
            </button>
            <button
              className={`nav-link-btn ${currentView === 'rooms' ? 'active' : ''}`}
              onClick={() => handleNavigate('rooms')}
            >
              Rooms & Suites
            </button>
            <button
              className={`nav-link-btn ${currentView === 'contact' ? 'active' : ''}`}
              onClick={() => handleNavigate('contact')}
            >
              Contact Us
            </button>
            <span className="text-white-50">|</span>
            <button
              className={`nav-link-btn ${currentView === 'login' ? 'active' : ''}`}
              onClick={() => handleNavigate('login')}
            >
              Sign In
            </button>
            <span className="text-white-50">|</span>
            <button
              className={`nav-link-btn ${currentView === 'register' ? 'active' : ''}`}
              onClick={() => handleNavigate('register')}
            >
              Register
            </button>
          </div>
        )}
      </div>

      {drawerOpen && user && !isAdmin && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="navbar-drawer" ref={drawerRef}>
            <div className="drawer-header">
              <img src={avatarUrl} alt="User avatar" className="drawer-avatar" />
              <div className="drawer-user-info">
                <h6 className="mb-0 fw-bold">{displayName}</h6>
                <small className="text-muted">{user.email}</small>
                <div className="mt-1">
                  <span
                    className="badge rounded-pill px-2 py-1"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="drawer-divider" />

            <div className="drawer-links">
              <button
                className={`drawer-link ${currentView === 'rooms' ? 'active' : ''}`}
                onClick={() => handleNavigate('rooms')}
              >
                <span className="drawer-link-icon">🛏️</span>
                <span>Rooms & Suites</span>
              </button>
              <button
                className={`drawer-link ${currentView === 'contact' ? 'active' : ''}`}
                onClick={() => handleNavigate('contact')}
              >
                <span className="drawer-link-icon">✉️</span>
                <span>Contact Us</span>
              </button>
              <div className="drawer-divider" />
              <button
                className={`drawer-link ${currentView === 'profile' ? 'active' : ''}`}
                onClick={() => handleNavigate('profile')}
              >
                <span className="drawer-link-icon">👤</span>
                <span>My Profile</span>
              </button>
              <button
                className={`drawer-link ${currentView === 'messages' ? 'active' : ''}`}
                onClick={() => handleNavigate('messages')}
              >
                <span className="drawer-link-icon">📬</span>
                <span>My Messages</span>
                {hasReplied && (
                  <span className="drawer-badge">●</span>
                )}
              </button>
              <button
                className={`drawer-link ${currentView === 'bookings' ? 'active' : ''}`}
                onClick={() => handleNavigate('bookings')}
              >
                <span className="drawer-link-icon">🧳</span>
                <span>My Bookings</span>
              </button>
              <button
                className={`drawer-link ${currentView === 'notifications' ? 'active' : ''}`}
                onClick={() => handleNavigate('notifications')}
              >
                <span className="drawer-link-icon">🔔</span>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="drawer-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
            </div>

            <div className="drawer-divider" />

            <div className="drawer-footer">
              <button className="drawer-logout" onClick={handleLogout}>
                <span className="drawer-link-icon">🚪</span>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
