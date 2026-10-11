import React, { useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const COUNTRY_CODES = [
  { code: '+63', label: '🇵🇭 Philippines (+63)' },
  { code: '+1', label: '🇺🇸 USA / Canada (+1)' },
  { code: '+44', label: '🇬🇧 United Kingdom (+44)' },
  { code: '+61', label: '🇦🇺 Australia (+61)' },
  { code: '+65', label: '🇸🇬 Singapore (+65)' },
  { code: '+81', label: '🇯🇵 Japan (+81)' },
  { code: '+86', label: '🇨🇳 China (+86)' },
  { code: '+91', label: '🇮🇳 India (+91)' },
  { code: '+49', label: '🇩🇪 Germany (+49)' },
  { code: '+33', label: '🇫🇷 France (+33)' },
  { code: '+39', label: '🇮🇹 Italy (+39)' },
  { code: '+34', label: '🇪🇸 Spain (+34)' },
  { code: '+82', label: '🇰🇷 South Korea (+82)' },
  { code: '+60', label: '🇲🇾 Malaysia (+60)' },
  { code: '+66', label: '🇹🇭 Thailand (+66)' },
  { code: '+62', label: '🇮🇩 Indonesia (+62)' },
];

const nameRegex = /^[a-zA-Z\s'-]+$/;
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

export default function Register({ onSwitchToLogin }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+63');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const validate = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2 || firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be 2-50 characters';
    } else if (!nameRegex.test(firstName)) {
      newErrors.firstName = 'Letters, spaces, hyphens, apostrophes only (no numbers)';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2 || lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be 2-50 characters';
    } else if (!nameRegex.test(lastName)) {
      newErrors.lastName = 'Letters, spaces, hyphens, apostrophes only (no numbers)';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{7,15}$/.test(phone)) {
      newErrors.phone = 'Phone number must be 7-15 digits';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await API.post('/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        countryCode,
        phone,
        password,
      });
      showToast('Registration successful! Redirecting to login...', 'success');
      setTimeout(() => onSwitchToLogin(), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-hero-bg">
      <div className="luxury-card animate-slide-up" style={{ maxWidth: '560px' }}>
        <h2 className="mb-4 fw-bold text-dark text-center">Create Account</h2>

        <form onSubmit={handleRegister} className="text-start" noValidate>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">FIRST NAME *</label>
              <input
                type="text"
                className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Juan"
              />
              {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">LAST NAME *</label>
              <input
                type="text"
                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dela Cruz"
              />
              {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">EMAIL ADDRESS *</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@example.com"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">PHONE NUMBER *</label>
            <div className="input-group">
              <select
                className="form-select"
                style={{ maxWidth: '45%' }}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                type="tel"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9171234567"
                maxLength={15}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
            <div className="form-text text-muted">Enter digits only (7-15 digits)</div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">PASSWORD *</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
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

          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">CONFIRM PASSWORD *</label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onCopy={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirmPassword((s) => !s)}
                tabIndex={-1}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            <div className="form-text text-muted">Type your password again (copy-paste disabled)</div>
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 py-3 fw-bold shadow-sm mb-3"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Account...
              </>
            ) : (
              'Register'
            )}
          </button>
          <button
            type="button"
            className="btn btn-link w-100 text-decoration-none text-muted small"
            onClick={onSwitchToLogin}
          >
            Already have an account? Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
