import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BackToTop from './BackToTop';

const NAVY = '#0f172a';
const GOLD = '#d4af37';

const nameRegex = /^[a-zA-Z\s'-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.com.ph', 'outlook.com',
  'hotmail.com', 'icloud.com', 'aol.com',
  'capipisabay.com', 'capipisabay.ph', 'capipisabayresort.com',
];
const allowedDomainSuffixes = ['.edu', '.edu.ph'];

const isAllowedEmailDomain = (domain) => {
  const lower = (domain || '').toLowerCase();
  if (ALLOWED_EMAIL_DOMAINS.includes(lower)) return true;
  return allowedDomainSuffixes.some((suffix) => lower.endsWith(suffix));
};

const COUNTRY_CODES = [
  { code: '+63', label: '🇵🇭 Philippines (+63)' },
  { code: '+1', label: '🇺🇸 USA / Canada (+1)' },
  { code: '+44', label: '🇬🇧 United Kingdom (+44)' },
  { code: '+65', label: '🇸🇬 Singapore (+65)' },
  { code: '+61', label: '🇦🇺 Australia (+61)' },
  { code: '+971', label: '🇦🇪 UAE (+971)' },
  { code: '+81', label: '🇯🇵 Japan (+81)' },
  { code: '+82', label: '🇰🇷 South Korea (+82)' },
];

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Capipisa1&backgroundColor=d4af37',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Capipisa2&backgroundColor=f5d76e',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Capipisa3&backgroundColor=0f172a',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Capipisa4&backgroundColor=1e3a5f',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Capipisa5&backgroundColor=e0b973',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Capipisa6&backgroundColor=c9a227',
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

const getToken = () => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const splitName = (name) => {
  if (!name) return { firstName: '', lastName: '' };
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState(() => {
    const fromContext = splitName(user?.name);
    return {
      firstName: user?.firstName || fromContext.firstName,
      lastName: user?.lastName || fromContext.lastName,
      email: user?.email || '',
      countryCode: user?.phone?.countryCode || '+63',
      phone: user?.phone?.number || '',
      avatar: user?.avatar || '',
    };
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const headers = getToken();
        const res = await API.get('/users/profile', { headers });
        const d = res.data;
        const { firstName, lastName } = splitName(d.name);
        setForm({
          firstName: d.firstName || firstName,
          lastName: d.lastName || lastName,
          email: d.email || '',
          countryCode: d.phone?.countryCode || '+63',
          phone: d.phone?.number || '',
          avatar: d.avatar || '',
        });
        setCreatedAt(d.createdAt || '');
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to load profile.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const nameError = submitted && (!form.firstName.trim() || form.firstName.trim().length < 2 || !nameRegex.test(form.firstName.trim()))
    ? 'First name must be 2-50 characters, letters only.' : '';
  const lastNameError = submitted && (!form.lastName.trim() || form.lastName.trim().length < 2 || !nameRegex.test(form.lastName.trim()))
    ? 'Last name must be 2-50 characters, letters only.' : '';
  const emailDomain = form.email.trim().split('@')[1];
  const emailError = submitted && (!form.email.trim() || !emailRegex.test(form.email.trim()) || !isAllowedEmailDomain(emailDomain))
    ? 'Please enter a valid email (Gmail, Yahoo, Outlook, or official @capipisabay.com).' : '';
  const phoneError = submitted && (!form.phone.trim() || !/^\d{10,11}$/.test(form.phone.trim()))
    ? 'Please provide a valid 10-digit or 11-digit phone number.' : '';

  const passwordActive = passwords.currentPassword || passwords.newPassword || passwords.confirmPassword;
  const currentPwError = submitted && passwordActive && !passwords.currentPassword
    ? 'Current password is required.' : '';
  const newPwError = submitted && passwordActive && (!passwords.newPassword || passwords.newPassword.length < 6)
    ? 'New password must be at least 6 characters.' : '';
  const confirmPwError = submitted && passwordActive && passwords.newPassword !== passwords.confirmPassword
    ? 'Passwords do not match.' : '';

  const hasErrors = nameError || lastNameError || emailError || phoneError ||
    currentPwError || newPwError || confirmPwError;

  const handleDiscard = () => {
    setSubmitted(false);
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    try {
      setSaving(true);
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();
      const payload = {
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        email: form.email.trim(),
        countryCode: form.countryCode,
        phone: form.phone.trim(),
        avatar: form.avatar.trim(),
      };
      if (passwordActive) {
        payload.currentPassword = passwords.currentPassword;
        payload.newPassword = passwords.newPassword;
      }
      const headers = getToken();
      const res = await API.put('/users/profile', payload, { headers });
      updateUser(res.data.user);
      setSubmitted(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="main-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border" style={{ color: GOLD }} role="status" />
      </div>
    );
  }

  const displayName = `${form.firstName} ${form.lastName}`.trim() || user?.name || 'Guest';
  const initials = (form.firstName?.[0] || '') + (form.lastName?.[0] || '');
  const avatarUrl = form.avatar || PRESET_AVATARS[0];

  return (
    <div className="main-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="container py-5" style={{ maxWidth: '900px' }}>
        <div className="text-center mb-5 animate-slide-up">
          <span
            className="badge mb-3 px-3 py-2 fw-bold text-uppercase rounded-pill"
            style={{ background: 'rgba(212,175,55,0.2)', color: GOLD, border: '1px solid rgba(212,175,55,0.4)' }}
          >
            Account Settings
          </span>
          <h1 className="display-5 fw-bold" style={{ color: NAVY }}>My Profile</h1>
          <p className="text-muted">Manage your personal information and security.</p>
        </div>

        {/* Profile Header Card */}
        <div
          className="p-4 mb-4 rounded-4 d-flex align-items-center gap-4 flex-wrap"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,58,95,0.95))',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(212,175,55,0.35)',
            color: '#fff',
            boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
          }}
        >
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{
              width: '90px', height: '90px', borderRadius: '50%',
              border: `3px solid ${GOLD}`, objectFit: 'cover', background: '#1e3a5f',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="flex-grow-1 min-w-0">
            <h4 className="fw-bold mb-1">{displayName}</h4>
            <p className="mb-1" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>{form.email}</p>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span
                className="badge rounded-pill px-3 py-1 fw-bold"
                style={{
                  background: user?.role === 'admin' ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.15)',
                  color: user?.role === 'admin' ? GOLD : '#fff',
                  border: `1px solid ${user?.role === 'admin' ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.2)'}`,
                  textTransform: 'capitalize',
                }}
              >
                {user?.role || 'guest'}
              </span>
              <small style={{ color: 'rgba(255,255,255,0.55)' }}>
                Member since {formatDate(createdAt)}
              </small>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div
            className="p-4 mb-4 rounded-4"
            style={{
              background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: NAVY }}>Personal Information</h5>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold text-uppercase">First Name</label>
                <input
                  type="text" name="firstName"
                  className={`form-control ${nameError ? 'is-invalid' : ''}`}
                  value={form.firstName} onChange={handleChange}
                />
                {nameError && <div className="invalid-feedback d-block">{nameError}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold text-uppercase">Last Name</label>
                <input
                  type="text" name="lastName"
                  className={`form-control ${lastNameError ? 'is-invalid' : ''}`}
                  value={form.lastName} onChange={handleChange}
                />
                {lastNameError && <div className="invalid-feedback d-block">{lastNameError}</div>}
              </div>
              <div className="col-12">
                <label className="form-label text-muted small fw-bold text-uppercase">Email Address</label>
                <input
                  type="email" name="email"
                  className={`form-control ${emailError ? 'is-invalid' : ''}`}
                  value={form.email} onChange={handleChange}
                />
                {emailError && <div className="invalid-feedback d-block">{emailError}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold text-uppercase">Country Code</label>
                <select
                  name="countryCode" className="form-control"
                  value={form.countryCode} onChange={handleChange}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label text-muted small fw-bold text-uppercase">Phone Number</label>
                <input
                  type="tel" name="phone"
                  className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                  value={form.phone} onChange={handleChange}
                  placeholder="9170000000"
                  maxLength={11}
                />
                {phoneError && <div className="invalid-feedback d-block">{phoneError}</div>}
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="mt-4">
              <label className="form-label text-muted small fw-bold text-uppercase">Avatar</label>
              <div className="d-flex flex-wrap gap-3 mb-3">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i} type="button"
                    onClick={() => setForm({ ...form, avatar: url })}
                    className="p-1 rounded-circle"
                    style={{
                      border: form.avatar === url ? `3px solid ${GOLD}` : '3px solid transparent',
                      background: 'none', cursor: 'pointer',
                      boxShadow: form.avatar === url ? '0 0 0 3px rgba(212,175,55,0.3)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <img src={url} alt={`Avatar ${i + 1}`} style={{ width: '52px', height: '52px', borderRadius: '50%', display: 'block' }} />
                  </button>
                ))}
              </div>
              <input
                type="text" name="avatar"
                className="form-control"
                value={form.avatar} onChange={handleChange}
                placeholder="Or paste a custom avatar URL..."
              />
            </div>
          </div>

          {/* Password & Security */}
          <div
            className="p-4 mb-4 rounded-4"
            style={{
              background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: NAVY }}>Password & Security</h5>
            <p className="text-muted small mb-3">Leave blank to keep your current password.</p>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label text-muted small fw-bold text-uppercase">Current Password</label>
                <input
                  type="password" name="currentPassword"
                  className={`form-control ${currentPwError ? 'is-invalid' : ''}`}
                  value={passwords.currentPassword} onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
                {currentPwError && <div className="invalid-feedback d-block">{currentPwError}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold text-uppercase">New Password</label>
                <input
                  type="password" name="newPassword"
                  className={`form-control ${newPwError ? 'is-invalid' : ''}`}
                  value={passwords.newPassword} onChange={handlePasswordChange}
                  placeholder="Min. 6 characters"
                />
                {newPwError && <div className="invalid-feedback d-block">{newPwError}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold text-uppercase">Confirm New Password</label>
                <input
                  type="password" name="confirmPassword"
                  className={`form-control ${confirmPwError ? 'is-invalid' : ''}`}
                  value={passwords.confirmPassword} onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                />
                {confirmPwError && <div className="invalid-feedback d-block">{confirmPwError}</div>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-end gap-3 flex-wrap">
            <button
              type="button"
              className="btn px-4 py-2 rounded-pill fw-bold"
              style={{
                background: 'transparent', color: NAVY, border: '1px solid rgba(15,23,42,0.2)',
              }}
              onClick={handleDiscard}
              disabled={saving}
            >
              Discard Changes
            </button>
            <button
              type="submit"
              className="btn px-5 py-2 rounded-pill fw-bold"
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #d4af37, #f5d76e)', color: NAVY,
                border: 'none', boxShadow: '0 6px 18px rgba(212,175,55,0.4)',
              }}
            >
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2" /> Saving...</>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      <BackToTop />
    </div>
  );
}
