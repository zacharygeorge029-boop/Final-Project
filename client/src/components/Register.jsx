import React, { useState } from 'react';
import API from '../services/api';

export default function Register({ onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guest');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await API.post('/auth/register', { name, email, password, role });
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="main-hero-bg">
      <div className="luxury-card animate-slide-up">
        <h2 className="mb-4 fw-bold text-dark text-center">Create Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        
        <form onSubmit={handleRegister} className="text-start">
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">FULL NAME</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">PASSWORD</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">ACCOUNT ROLE</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="guest">Guest / User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-dark w-100 py-3 fw-bold shadow-sm mb-3">
            Register
          </button>
          <button type="button" className="btn btn-link w-100 text-decoration-none text-muted small" onClick={onSwitchToLogin}>
            Already have an account? Sign In
          </button>
        </form>
      </div>
    </div>
  );
}