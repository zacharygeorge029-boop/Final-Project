import React from 'react';
import './Navbar.css';

export default function Navbar({ user, onLogout, setCurrentView, currentView }) {
  return (
    <nav className="custom-navbar animate-fade-in">
      <span className="navbar-brand-custom" onClick={() => setCurrentView('home')}>
        🌊 Capipisa Bay Resort & Hotel
      </span>
      
      <div className="navbar-links">
        <button 
          className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`} 
          onClick={() => setCurrentView('home')}
        >
          Home
        </button>
        <button 
          className={`nav-link-btn ${currentView === 'rooms' ? 'active' : ''}`} 
          onClick={() => setCurrentView('rooms')}
        >
          Rooms & Suites
        </button>
        <button 
          className={`nav-link-btn ${currentView === 'contact' ? 'active' : ''}`} 
          onClick={() => setCurrentView('contact')}
        >
          Contact Us
        </button>

        {user ? (
          <>
            <span className="navbar-welcome ms-4">Welcome, {user.name}</span>
            <button className="nav-link-btn text-warning ms-4" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <div className="d-flex align-items-center ms-4" style={{ gap: '15px' }}>
            <button 
              className={`nav-link-btn ${currentView === 'login' ? 'active' : ''}`} 
              onClick={() => setCurrentView('login')}
            >
              Sign In
            </button>
            <span className="text-white-50 px-1">|</span>
            <button 
              className={`nav-link-btn ${currentView === 'register' ? 'active' : ''}`} 
              onClick={() => setCurrentView('register')}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}