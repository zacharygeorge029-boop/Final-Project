import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AuthModal from './components/AuthModal';
import RoomList from './components/RoomList';
import Contact from './components/Contact';
import UserBookings from './components/UserBookings';
import AdminDashboard from './components/AdminDashboard';
import { ToastProvider } from './context/ToastContext';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [bookingParams, setBookingParams] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('rooms');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('home');
  };

  return (
    <ToastProvider>
      <div>
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          setCurrentView={setCurrentView} 
          currentView={currentView}
        />

        {currentView === 'home' && (
          <Home 
            onNavigateRooms={(params) => {
              setBookingParams(params);
              setCurrentView('rooms');
            }}
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}
        {currentView === 'rooms' && (
          <RoomList
            user={user}
            onNavigateLogin={() => setCurrentView('login')}
            bookingParams={bookingParams}
          />
        )}
        {currentView === 'bookings' && <UserBookings />}
        {currentView === 'admin' && <AdminDashboard user={user} />}
        {currentView === 'contact' && <Contact />}
        {currentView === 'login' && <AuthModal defaultMode="login" onLoginSuccess={handleLoginSuccess} />}
        {currentView === 'register' && <AuthModal defaultMode="register" onLoginSuccess={handleLoginSuccess} />}
      </div>
    </ToastProvider>
  );
}

export default App;