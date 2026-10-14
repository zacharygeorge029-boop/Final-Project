import React, { useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import BackToTop from './BackToTop';

const NAVY = '#0f172a';
const GOLD = '#d4af37';

export default function Contact({ user, onNavigateLogin }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const isLoggedIn = !!user;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const messageError =
    submitted && (!form.message.trim() || form.message.trim().length < 10 || form.message.trim().length > 2000)
      ? 'Please enter a message between 10 and 2000 characters.'
      : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      showToast('Please Sign In or Register to send an inquiry to our concierge team.', 'warning');
      onNavigateLogin?.();
      return;
    }

    setSubmitted(true);
    if (messageError) return;

    try {
      setSubmitting(true);
      await API.post('/inquiries', {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        userId: user.id,
      });
      setForm((prev) => ({ ...prev, message: '' }));
      setSubmitted(false);
      showToast('Message sent! Our concierge will reach out to you shortly.', 'success');
    } catch (err) {
      console.error('Inquiry submission error:', err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to send your message. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="luxury-card animate-slide-up" style={{ maxWidth: '560px', margin: '0 auto' }}>
        <h2 className="mb-2 fw-bold text-dark text-center">Contact Us</h2>
        <p className="text-muted text-center small mb-4">
          We are here to assist with your inquiries and luxury reservations.
        </p>

        {!isLoggedIn && (
          <div
            className="mb-4 p-3 rounded-3 text-center"
            style={{
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#8a6d1f',
            }}
          >
            <p className="mb-2 fw-semibold small">
              Please Sign In or Register to send an inquiry to our concierge team.
            </p>
            <button
              type="button"
              className="btn fw-bold rounded-pill px-4 py-2"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
                color: NAVY,
                border: 'none',
              }}
              onClick={onNavigateLogin}
            >
              Sign In / Register
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="text-start">
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold text-uppercase">Your Name</label>
            <div className="position-relative">
              <span className="position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: GOLD, pointerEvents: 'none' }}>👤</span>
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                disabled={isLoggedIn}
                style={{ paddingLeft: '40px', backgroundColor: isLoggedIn ? '#f1f5f9' : '' }}
                placeholder="Juan Dela Cruz"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold text-uppercase">Email Address</label>
            <div className="position-relative">
              <span className="position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: GOLD, pointerEvents: 'none' }}>✉️</span>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                disabled={isLoggedIn}
                style={{ paddingLeft: '40px', backgroundColor: isLoggedIn ? '#f1f5f9' : '' }}
                placeholder="name@gmail.com"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label text-muted small fw-bold text-uppercase">Message</label>
            <div className="position-relative">
              <span className="position-absolute" style={{ left: '14px', top: '14px', color: GOLD, pointerEvents: 'none' }}>💬</span>
              <textarea
                name="message"
                className={`form-control ${messageError ? 'is-invalid' : ''}`}
                rows="4"
                value={form.message}
                onChange={handleChange}
                disabled={!isLoggedIn}
                style={{ paddingLeft: '40px', resize: 'vertical' }}
                placeholder="How can we help you?"
              />
              {messageError && <div className="invalid-feedback d-block">{messageError}</div>}
            </div>
          </div>
          <button
            type="submit"
            className="btn w-100 py-3 fw-bold rounded-pill border-0"
            disabled={submitting || !isLoggedIn}
            style={{
              background: isLoggedIn ? 'linear-gradient(135deg, #d4af37, #f5d76e)' : '#cbd5e1',
              color: isLoggedIn ? NAVY : '#64748b',
              boxShadow: isLoggedIn ? '0 6px 18px rgba(212,175,55,0.4)' : 'none',
              transition: 'all 0.3s ease',
              cursor: isLoggedIn ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      </div>
      <BackToTop />
    </div>
  );
}
