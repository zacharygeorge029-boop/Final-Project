import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AuthModal from './components/AuthModal';
import RoomList from './components/RoomList';
import Contact from './components/Contact';
import UserBookings from './components/UserBookings';
import MyMessages from './components/MyMessages';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import AdminDashboard from './components/AdminDashboard';
import ConfirmModal from './components/ConfirmModal';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';

const GUEST_ROUTES = ['home', 'rooms', 'contact', 'bookings', 'messages', 'profile'];
const ADMIN_REDIRECT_ROUTES = [...GUEST_ROUTES, 'login', 'register'];

function App() {
  const { user, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [bookingParams, setBookingParams] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [adminTab, setAdminTab] = useState('rooms');
  const { showToast } = useToast();

  const handleLoginSuccess = (userData) => {
    login(userData);
    setCurrentView(userData.role === 'admin' ? 'admin' : 'rooms');
  };

  const performLogout = () => {
    logout();
    setCurrentView('home');
    setConfirmLogout(false);
  };

  const handleLogout = () => {
    setConfirmLogout(true);
  };

  const navigate = (view, tab) => {
    const isAdmin = user?.role === 'admin';

    if (isAdmin && ADMIN_REDIRECT_ROUTES.includes(view)) {
      showToast('Admins are redirected to the Admin Dashboard.', 'warning');
      setCurrentView('admin');
      return;
    }

    if (view === 'admin' && !isAdmin) {
      if (!user) {
        showToast('Please sign in to continue.', 'warning');
        setCurrentView('login');
      } else {
        showToast('Unauthorized access: Admin privileges required.', 'error');
        setCurrentView('home');
      }
      return;
    }

    if ((view === 'bookings' || view === 'messages' || view === 'profile' || view === 'notifications') && !user) {
      showToast('Please sign in to continue.', 'warning');
      setCurrentView('login');
      return;
    }

    if (view === 'admin' && tab) {
      setAdminTab(tab);
    }

    setCurrentView(view);
  };

  const safeView = (() => {
    const isAdmin = user?.role === 'admin';
    if (isAdmin && ADMIN_REDIRECT_ROUTES.includes(currentView)) return 'admin';
    if (currentView === 'admin' && !isAdmin) return user ? 'home' : 'login';
    return currentView;
  })();

  return (
    <div>
      <Navbar
        user={user}
        onLogout={handleLogout}
        setCurrentView={navigate}
        currentView={safeView}
      />

      {safeView === 'home' && (
        <Home
          onNavigateRooms={(params) => {
            setBookingParams(params);
            navigate('rooms');
          }}
          onNavigateLogin={() => navigate('login')}
        />
      )}
      {safeView === 'rooms' && (
        <RoomList
          user={user}
          onNavigateLogin={() => navigate('login')}
          bookingParams={bookingParams}
        />
      )}
      {safeView === 'bookings' && <UserBookings />}
      {safeView === 'messages' && <MyMessages onNavigateContact={() => navigate('contact')} />}
      {safeView === 'profile' && <Profile />}
      {safeView === 'notifications' && <Notifications onNavigate={navigate} isAdmin={user?.role === 'admin'} />}
      {safeView === 'admin' && <AdminDashboard user={user} initialTab={adminTab} />}
      {safeView === 'contact' && (
        <Contact user={user} onNavigateLogin={() => navigate('login')} />
      )}
      {safeView === 'login' && <AuthModal defaultMode="login" onLoginSuccess={handleLoginSuccess} />}
      {safeView === 'register' && <AuthModal defaultMode="register" onLoginSuccess={handleLoginSuccess} />}

      <ConfirmModal
        show={confirmLogout}
        title="Sign Out"
        icon="👋"
        message="Are you sure you want to sign out of your Capipisa Bay account?"
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        onConfirm={performLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}

export default App;
