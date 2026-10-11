import React, { useState, useRef, useEffect } from 'react';
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

const HERO_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTkv9liNysUaIUcXrZViJvpFBlkA9TlCsH7IPmW6Lhd6lxs3knZgq2gKQ&s=10',
  'https://cf.bstatic.com/xdata/images/hotel/max1024x768/290376069.jpg?k=d286ec60cc4e64cd594d45a2c45e8cd8244903f6b2b6828d36be049d592e795c&o=',
  'https://cdn.webhotelier.net/photos/w=1920/bluebayr-luxpp/L569294.jpg',
];

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

const NAVY = '#0f172a';
const GOLD = '#d4af37';
const GOLD_GRADIENT = 'linear-gradient(135deg, #d4af37 0%, #f5d76e 100%)';

export default function AuthModal({ defaultMode = 'login', onLoginSuccess }) {
  const [mode, setMode] = useState(defaultMode);
  const [bgSlide, setBgSlide] = useState(0);

  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem('rememberedEmail'));

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+63');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const firstNameRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    if (mode === 'login') {
      emailRef.current?.focus();
    } else {
      firstNameRef.current?.focus();
    }
  }, [mode]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBgSlide((p) => (p + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nameError = (value) => {
    if (!value.trim()) return 'Name is required';
    if (value.trim().length < 2 || value.trim().length > 50) return 'Must be 2-50 characters';
    if (!nameRegex.test(value)) return 'Letters, spaces, hyphens, apostrophes only';
    return '';
  };

  const emailError = (value) => {
    if (!value.trim()) return 'Email is required';
    if (!emailRegex.test(value)) return 'Enter a valid email (e.g. name@gmail.com)';
    return '';
  };

  const phoneError = (value) => {
    if (!value.trim()) return 'Phone number is required';
    if (!/^\d{7,15}$/.test(value)) return 'Enter 7-15 digits';
    return '';
  };

  const passwordError = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'At least 6 characters';
    return '';
  };

  const confirmError = (value, pwd) => {
    if (!value) return 'Please confirm your password';
    if (value !== pwd) return 'Passwords do not match';
    return '';
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: '#ff6b6b' };
    if (score <= 3) return { score: 3, label: 'Fair', color: '#f5d76e' };
    return { score: 5, label: 'Strong', color: '#4ade80' };
  };

  const handleBlur = (field) => {
    let msg = '';
    if (field === 'firstName') msg = nameError(firstName);
    else if (field === 'lastName') msg = nameError(lastName);
    else if (field === 'email') msg = emailError(email);
    else if (field === 'phone') msg = phoneError(phone);
    else if (field === 'password') msg = passwordError(password);
    else if (field === 'confirmPassword') msg = confirmError(confirmPassword, password);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const validateLogin = () => {
    const e = {};
    e.email = emailError(email);
    if (!password) e.password = 'Password is required';
    const filtered = Object.fromEntries(Object.entries(e).filter(([, v]) => v));
    setErrors(filtered);
    return Object.keys(filtered).length === 0;
  };

  const validateRegister = () => {
    const e = {};
    e.firstName = nameError(firstName);
    e.lastName = nameError(lastName);
    e.email = emailError(email);
    e.phone = phoneError(phone);
    e.password = passwordError(password);
    e.confirmPassword = confirmError(confirmPassword, password);
    const filtered = Object.fromEntries(Object.entries(e).filter(([, v]) => v));
    setErrors(filtered);
    return Object.keys(filtered).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setSubmitting(true);
    try {
      const res = await API.post('/auth/login', { email: email.trim(), password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (remember) {
        localStorage.setItem('rememberedEmail', email.trim().toLowerCase());
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      showToast(`Welcome back, ${res.data.user.firstName}!`, 'success');
      onLoginSuccess(res.data.user);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Login failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
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
      showToast('Account created successfully! You can now sign in.', 'success');
      setMode('login');
      setErrors({});
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Registration failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    showToast('Please contact the front desk at frontdesk@capipisabay.com for password assistance.', 'info');
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        background: NAVY,
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {HERO_IMAGES.map((img, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${img}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === bgSlide ? 0.18 : 0,
            transition: 'opacity 1.4s ease-in-out',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.85) 100%)',
        }}
      />

      <div
        className="animate-slide-up"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '980px',
          display: 'flex',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          border: `1px solid rgba(212,175,55,0.25)`,
        }}
      >
        {/* Side A: Resort Visual */}
        <div
          className="d-none d-md-flex flex-column justify-content-between p-5"
          style={{
            width: '48%',
            background: `linear-gradient(160deg, rgba(15,23,42,0.88), rgba(20,50,90,0.7)), url("${HERO_IMAGES[1]}") center/cover`,
            color: '#fff',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ color: GOLD, letterSpacing: '3px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Capipisa Bay Resort &amp; Hotel
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '18px', lineHeight: 1.2 }}>
              {mode === 'login' ? 'Welcome back to your coastal sanctuary' : 'Begin your luxury escape today'}
            </h2>
          </div>
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {[0, 1, 2, 3, 4].map((s) => (
                <span key={s} style={{ color: GOLD, fontSize: '1.1rem' }}>★</span>
              ))}
            </div>
            <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              "The ocean views are breathtaking and the service is absolutely world-class. A true five-star sanctuary."
            </p>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '12px' }}>
              — Isabella R., Manila
            </div>
          </div>
        </div>

        {/* Side B: Form */}
        <div
          style={{
            width: '100%',
            background: 'rgba(15,23,42,0.96)',
            backdropFilter: 'blur(20px)',
            padding: '40px 36px',
          }}
        >
          <div
            className="d-flex p-1 mb-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '14px',
              border: '1px solid rgba(212,175,55,0.15)',
            }}
          >
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="flex-grow-1 py-2 fw-bold rounded"
              style={{
                background: mode === 'login' ? GOLD_GRADIENT : 'transparent',
                color: mode === 'login' ? NAVY : 'rgba(255,255,255,0.6)',
                border: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className="flex-grow-1 py-2 fw-bold rounded"
              style={{
                background: mode === 'register' ? GOLD_GRADIENT : 'transparent',
                color: mode === 'register' ? NAVY : 'rgba(255,255,255,0.6)',
                border: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
              }}
            >
              Create Account
            </button>
          </div>

          {errors.form && (
            <div
              className="mb-3 p-3 rounded text-center small"
              style={{ background: 'rgba(220,53,69,0.12)', color: '#ff6b6b', border: '1px solid rgba(220,53,69,0.25)' }}
            >
              {errors.form}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} noValidate>
              <div className="luxury-field">
                <input
                  ref={emailRef}
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  autoComplete="email"
                />
                <label>Email Address</label>
              </div>
              {errors.email && <div className="luxury-error">{errors.email}</div>}

              <div className="luxury-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  autoComplete="current-password"
                />
                <label>Password</label>
                <button
                  type="button"
                  className="luxury-eye"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <div className="luxury-error">{errors.password}</div>}

              <div className="d-flex justify-content-between align-items-center mb-4">
                <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', margin: 0 }}>
                  <span className="luxury-checkbox">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                  </span>
                  <span className="small" style={{ color: 'rgba(255,255,255,0.7)' }}>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="btn btn-link p-0 small text-decoration-none"
                  style={{ color: GOLD }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-100 py-3 fw-bold rounded-pill luxury-cta"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} noValidate>
              <div className="row g-3">
                <div className="col-6">
                  <div className="luxury-field">
                    <input
                      ref={firstNameRef}
                      type="text"
                      placeholder=" "
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => handleBlur('firstName')}
                      autoComplete="given-name"
                    />
                    <label>First Name</label>
                  </div>
                  {errors.firstName && <div className="luxury-error">{errors.firstName}</div>}
                </div>
                <div className="col-6">
                  <div className="luxury-field">
                    <input
                      type="text"
                      placeholder=" "
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => handleBlur('lastName')}
                      autoComplete="family-name"
                    />
                    <label>Last Name</label>
                  </div>
                  {errors.lastName && <div className="luxury-error">{errors.lastName}</div>}
                </div>
              </div>

              <div className="luxury-field">
                <input
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  autoComplete="email"
                />
                <label>Email Address</label>
              </div>
              {errors.email && <div className="luxury-error">{errors.email}</div>}

              <div className="luxury-phone-group">
                <label className="luxury-phone-label">Phone Number</label>
                <div className="luxury-phone-row">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="luxury-select"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="917 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('phone')}
                    maxLength={15}
                    autoComplete="tel-national"
                  />
                </div>
                <div className="luxury-phone-hint">Enter digits only (7-15 digits)</div>
              </div>
              {errors.phone && <div className="luxury-error">{errors.phone}</div>}

              <div className="luxury-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  autoComplete="new-password"
                />
                <label>Password</label>
                <button
                  type="button"
                  className="luxury-eye"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <div className="luxury-error">{errors.password}</div>}
              {password && (
                <div className="luxury-strength">
                  <div className="luxury-strength-bar">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="luxury-strength-segment"
                        style={{
                          background: i <= getPasswordStrength(password).score
                            ? getPasswordStrength(password).color
                            : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="luxury-strength-label" style={{ color: getPasswordStrength(password).color }}>
                    {getPasswordStrength(password).label}
                  </span>
                </div>
              )}

              <div className="luxury-field">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder=" "
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  autoComplete="new-password"
                />
                <label>Confirm Password</label>
                <button
                  type="button"
                  className="luxury-eye"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  tabIndex={-1}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && <div className="luxury-error">{errors.confirmPassword}</div>}
              {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                <div className="luxury-match">✓ Passwords match</div>
              )}

              <button
                type="submit"
                className="w-100 py-3 fw-bold rounded-pill luxury-cta mt-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          <div className="text-center mt-4 small" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="btn btn-link p-0 text-decoration-none fw-bold"
                  style={{ color: GOLD }}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="btn btn-link p-0 text-decoration-none fw-bold"
                  style={{ color: GOLD }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
