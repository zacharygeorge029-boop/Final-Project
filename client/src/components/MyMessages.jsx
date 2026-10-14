import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import BackToTop from './BackToTop';

const NAVY = '#0f172a';
const GOLD = '#d4af37';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getToken = () => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export default function MyMessages({ onNavigateContact }) {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const headers = getToken();
      try {
        const res = await API.get('/inquiries/my-inquiries', { headers });
        setInquiries(res.data);
        return;
      } catch (primaryErr) {
        const userId = user?._id || user?.id;
        if (userId) {
          const res = await API.get(`/inquiries/user/${userId}`);
          setInquiries(res.data);
          return;
        }
        throw primaryErr;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [user]);

  const statusBadge = (status) => {
    const isReplied = status === 'replied';
    return (
      <span
        className={`badge rounded-pill px-3 py-2 fw-bold ${
          isReplied ? 'bg-success' : 'bg-warning text-dark'
        }`}
      >
        {isReplied ? 'Replied by Concierge' : 'Pending Concierge'}
      </span>
    );
  };

  return (
    <div className="main-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="container py-5" style={{ maxWidth: '900px' }}>
        <div className="text-center mb-5 animate-slide-up">
          <span
            className="badge mb-3 px-3 py-2 fw-bold text-uppercase rounded-pill"
            style={{ background: 'rgba(212,175,55,0.2)', color: GOLD, border: '1px solid rgba(212,175,55,0.4)' }}
          >
            Concierge Correspondence
          </span>
          <h1 className="display-5 fw-bold" style={{ color: NAVY }}>My Messages</h1>
          <p className="text-muted">Review your inquiries and official concierge replies.</p>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: GOLD }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading your messages...</p>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger text-center rounded-3">{error}</div>
        )}

        {!loading && !error && inquiries.length === 0 && (
          <div
            className="text-center py-5 rounded-4 animate-fade-in"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212,175,55,0.25)',
            }}
          >
            <div className="fs-1 mb-3">💬</div>
            <h5 className="fw-bold" style={{ color: NAVY }}>No messages yet</h5>
            <p className="text-muted mb-4">
              Reach out to our concierge team and we'll get back to you right here.
            </p>
            <button
              type="button"
              className="btn px-5 py-2 rounded-pill fw-bold"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
                color: NAVY, border: 'none',
                boxShadow: '0 6px 18px rgba(212,175,55,0.4)',
              }}
              onClick={onNavigateContact}
            >
              Contact Concierge
            </button>
          </div>
        )}

        {!loading && !error && inquiries.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {inquiries.map((inquiry) => {
              const isReplied = inquiry.status === 'replied';
              return (
                <div
                  key={inquiry._id}
                  className="animate-fade-in p-4 rounded-4"
                  style={{
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${isReplied ? 'rgba(16,185,129,0.3)' : 'rgba(212,175,55,0.3)'}`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <small className="text-muted">
                      Sent {formatDate(inquiry.createdAt)}
                    </small>
                    {statusBadge(inquiry.status)}
                  </div>

                  <label className="form-label text-muted small fw-bold text-uppercase mb-1">
                    Your Inquiry
                  </label>
                  <div
                    className="p-3 mb-3"
                    style={{
                      background: 'rgba(15,23,42,0.04)',
                      borderRadius: '12px',
                      borderLeft: '3px solid #d4af37',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      color: NAVY,
                    }}
                  >
                    {inquiry.message}
                  </div>

                  {isReplied ? (
                    <>
                      <label className="form-label text-muted small fw-bold text-uppercase mb-1">
                        Official Concierge Reply
                      </label>
                      <div
                        className="p-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(15,23,42,0.06), rgba(212,175,55,0.08))',
                          borderRadius: '12px',
                          borderLeft: '3px solid #d4af37',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                          color: NAVY,
                        }}
                      >
                        {inquiry.replyMessage}
                        {inquiry.repliedAt && (
                          <div className="mt-2 text-muted small">
                            Replied {formatDate(inquiry.repliedAt)}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div
                      className="p-3 text-center rounded-3"
                      style={{ background: 'rgba(212,175,55,0.08)', border: '1px dashed rgba(212,175,55,0.5)' }}
                    >
                      <div className="mb-1">⏳</div>
                      <small className="text-muted">
                        Our concierge team is reviewing your message. A reply will appear here shortly.
                      </small>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BackToTop />
    </div>
  );
}
