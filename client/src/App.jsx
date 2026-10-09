import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import RoomList from './components/RoomList';
import Contact from './components/Contact';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');

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
    <div>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        setCurrentView={setCurrentView} 
        currentView={currentView}
      />

      {currentView === 'home' && (
        <Home 
          onNavigateRooms={() => setCurrentView('rooms')} 
          onNavigateLogin={() => setCurrentView('login')} 
        />
      )}
      {currentView === 'rooms' && <RoomList />}
      {currentView === 'contact' && <Contact />}
      {currentView === 'login' && <Login onLoginSuccess={handleLoginSuccess} />}
      {currentView === 'register' && <Register onSwitchToLogin={() => setCurrentView('login')} />}
    </div>
  );
}

export default App;