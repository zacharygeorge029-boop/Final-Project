import React, { useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8s-3.5-6-8-6S0 8 0 8s3.5 6 8 6 16 8 16 8zM8 10.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.359 11.238C14.682 9.97 16 8 16 8s-3.5-6-8-6a9.98 9.98 0 0 0-4.263.978l.758.758A8.98 8.98 0 0 1 8 2.5c4.5 0 7.5 5.5 7.5 5.5s-.93 1.643-2.138 2.94l.997.941zM.5 2.5l13 13 .707-.707-13-13L.5 2.5zm4.986 4.986L4.486 9.47l.014.03A2.5 2.5 0 0 0 8 10.5c.22 0 .433-.024.635-.07l.764.764A3.5 3.5 0 0 1 4.5 8c0-.17.013-.338.038-.514zM3.894 6.18l.707.707C3.07 8.014 2.5 8 2.5 8S3.5 9.97 4.87 11.12l.707-.707C4.12 9.245 3.5 8 3.5 8c.12-.34.28-.67.46-.98z" />
  </svg>
);

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      showToast(`Welcome back, ${res.data.user.firstName}!`, 'success');
      onLoginSuccess(res.data.user);
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-hero-bg">
      <div className="luxury-card animate-slide-up">
        <h2 className="mb-4 fw-bold text-dark text-center">Welcome Back</h2>

        <form onSubmit={handleLogin} className="text-start" noValidate>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@example.com"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">PASSWORD</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          <button
            type="submit"
            className="btn btn-dark w-100 py-3 fw-bold shadow-sm"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
