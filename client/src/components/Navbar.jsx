import React, { useState } from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';

export default function Navbar({ user, onLogout, setCurrentView, currentView }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (view) => {
    setCurrentView(view);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <nav className="custom-navbar animate-fade-in">
      <span className="navbar-brand-custom" onClick={() => handleNavigate('home')}>
        <img src={logo} alt="Capipisa Bay Resort & Hotel" className="navbar-logo" />
        <span className="navbar-brand-text">Capipisa Bay Resort & Hotel</span>
      </span>

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
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

        {user ? (
          <>
            {user.role === 'admin' && (
              <button
                className={`nav-link-btn ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => handleNavigate('admin')}
              >
                Admin Dashboard
              </button>
            )}
            <button
              className={`nav-link-btn ${currentView === 'bookings' ? 'active' : ''}`}
              onClick={() => handleNavigate('bookings')}
            >
              My Bookings
            </button>
            <span className="navbar-welcome ms-4">Welcome, {user.firstName || user.name}</span>
            <button className="nav-link-btn text-warning ms-4" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <div className="d-flex align-items-center" style={{ gap: '15px' }}>
            <button
              className={`nav-link-btn ${currentView === 'login' ? 'active' : ''}`}
              onClick={() => handleNavigate('login')}
            >
              Sign In
            </button>
            <span className="text-white-50 px-1">|</span>
            <button
              className={`nav-link-btn ${currentView === 'register' ? 'active' : ''}`}
              onClick={() => handleNavigate('register')}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
