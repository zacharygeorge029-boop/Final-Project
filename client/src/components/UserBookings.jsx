import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { showToast } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reservations/my-reservations');
      setBookings(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = (booking) => {
    setCancelTarget(booking);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const reservationId = cancelTarget._id;
    const refundEligible = isEligibleForRefund(cancelTarget);
    try {
      setCancellingId(reservationId);
      const res = await API.put(`/reservations/${reservationId}/cancel`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === reservationId
            ? {
                ...b,
                status: 'Cancelled',
                paymentStatus: refundEligible ? 'refund_requested' : b.paymentStatus,
              }
            : b
        )
      );
      showToast(res.data?.message || 'Reservation cancelled successfully.', 'success');
      setCancelTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel reservation.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const isConfirmed = status === 'Confirmed';
    return (
      <span
        className={`badge rounded-pill px-3 py-2 fw-bold ${
          isConfirmed ? 'bg-success' : 'bg-secondary'
        }`}
      >
        {status}
      </span>
    );
  };

  const getPaymentBadge = (booking) => {
    const method = booking.paymentMethod;
    const labelMap = {
      card: 'Paid via Card',
      ewallet: 'Paid via E-Wallet',
      cash: 'Pay Upon Arrival',
      arrival: 'Pay Upon Arrival',
      gcash: 'Paid via E-Wallet',
    };
    const label = labelMap[method] || method || 'N/A';
    const isOnline = method === 'card' || method === 'ewallet' || method === 'gcash';
    return (
      <span
        className="badge rounded-pill px-3 py-2 fw-bold"
        style={{
          background: isOnline ? 'rgba(212,175,55,0.15)' : 'rgba(148,163,184,0.15)',
          color: isOnline ? '#d4af37' : '#64748b',
          border: `1px solid ${isOnline ? 'rgba(212,175,55,0.4)' : 'rgba(148,163,184,0.4)'}`,
        }}
      >
        {label}
      </span>
    );
  };

  const getRefundBadge = (booking) => {
    const status = booking.paymentStatus;
    if (status === 'refund_requested') {
      return (
        <span
          className="badge rounded-pill px-3 py-2 fw-bold"
          style={{
            background: 'rgba(251,191,36,0.15)',
            color: '#d97706',
            border: '1px solid rgba(251,191,36,0.4)',
          }}
        >
          Refund Requested
        </span>
      );
    }
    if (status === 'refunded') {
      return (
        <span
          className="badge rounded-pill px-3 py-2 fw-bold"
          style={{
            background: 'rgba(34,197,94,0.15)',
            color: '#16a34a',
            border: '1px solid rgba(34,197,94,0.4)',
          }}
        >
          Refunded
        </span>
      );
    }
    return null;
  };

  const isEligibleForRefund = (booking) => {
    const method = booking.paymentMethod;
    return method === 'card' || method === 'ewallet' || method === 'gcash';
  };

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div
        className="text-center text-white py-5 mb-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url("https://i.pinimg.com/1200x/2f/c6/b6/2fc6b619bb0af3dc94971c099d25bbae.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container animate-slide-up">
          <h1 className="display-5 fw-bold mb-2">My Bookings</h1>
          <p className="lead mb-0" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Review and manage your reservations at Capipisa Bay Resort & Hotel
          </p>
        </div>
      </div>

      <div className="container pb-5">
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading your bookings...</p>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger text-center">{error}</div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-5">
            <div className="display-1 mb-4">🏝️</div>
            <h3 className="fw-bold text-dark mb-2">No bookings yet</h3>
            <p className="text-muted mb-4">
              You haven't made any reservations. Start planning your coastal escape today.
            </p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="row g-4">
            {bookings.map((booking) => (
              <div className="col-md-6 col-lg-4" key={booking._id}>
                <div
                  className="card h-100 border-0 shadow-sm overflow-hidden"
                  style={{ borderRadius: '16px', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.04)';
                  }}
                >
                  <div
                    className="p-4 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span className="text-uppercase small fw-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          Room
                        </span>
                        <h5 className="fw-bold mb-0 mt-1">
                          {booking.room?.type || 'Reserved Room'}
                        </h5>
                        {booking.room?.roomNumber && (
                          <span className="small" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            Room #{booking.room.roomNumber}
                          </span>
                        )}
                        {booking.bookingReference && (
                          <div className="small mt-1" style={{ color: '#f5d76e', letterSpacing: '0.5px' }}>
                            Ref: #{booking.bookingReference}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  <div className="card-body p-4">
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2">📅</span>
                        <span className="text-muted small fw-bold text-uppercase">Check-in</span>
                      </div>
                      <p className="mb-0 fw-semibold text-dark">
                        {formatDate(booking.checkInDate)}
                      </p>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2">🚪</span>
                        <span className="text-muted small fw-bold text-uppercase">Check-out</span>
                      </div>
                      <p className="mb-0 fw-semibold text-dark">
                        {formatDate(booking.checkOutDate)}
                      </p>
                    </div>

                    <hr className="my-3" />

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted small fw-bold text-uppercase">Total Paid</span>
                      <span className="fs-5 fw-bold text-dark">
                        ${Number(booking.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {getPaymentBadge(booking)}
                      {getRefundBadge(booking)}
                    </div>

                    {booking.status === 'Confirmed' ? (
                      <button
                        className="btn btn-outline-danger w-100 py-2 fw-bold rounded-pill"
                        onClick={() => handleCancel(booking)}
                        disabled={cancellingId === booking._id}
                      >
                        {cancellingId === booking._id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Cancelling...
                          </>
                        ) : (
                          'Cancel Reservation'
                        )}
                      </button>
                    ) : (
                      <div className="text-center text-muted small py-2">
                        This reservation has been cancelled.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cancelTarget && (
        <div
          onClick={() => setCancelTarget(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(212,175,55,0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              padding: '32px',
              animation: 'slideUp 0.3s ease',
            }}
          >
            <div className="text-center mb-3">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, rgba(220,53,69,0.12), rgba(212,175,55,0.15))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  border: '2px solid rgba(220,53,69,0.25)',
                }}
              >
                ⚠️
              </div>
              <h4 className="fw-bold mb-2" style={{ color: '#0f172a' }}>
                Cancel Reservation
              </h4>
              <p className="text-muted mb-1">
                {cancelTarget.room?.type || 'Reserved Room'}
                {cancelTarget.room?.roomNumber && ` · Room #${cancelTarget.room.roomNumber}`}
              </p>
              <p className="text-muted mb-0" style={{ lineHeight: 1.6 }}>
                Are you sure you want to cancel your stay at Capipisa Bay Resort &amp; Hotel?
                This action cannot be undone.
              </p>
              {isEligibleForRefund(cancelTarget) && (
                <div
                  className="mt-3 p-3 rounded-3"
                  style={{
                    background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.3)',
                  }}
                >
                  <p className="mb-0 small" style={{ color: '#92680f', lineHeight: 1.5 }}>
                    💳 Since you paid via {cancelTarget.paymentMethod === 'card' ? 'Card' : 'E-Wallet'}, a refund of{' '}
                    <strong>${Number(cancelTarget.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>{' '}
                    will be processed back to your payment method within 5-7 business days after admin approval.
                  </p>
                </div>
              )}
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="button"
                className="btn flex-grow-1 py-2 fw-bold rounded-pill"
                style={{
                  background: '#f1f5f9',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                }}
                onClick={() => setCancelTarget(null)}
                disabled={cancellingId === cancelTarget._id}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="btn flex-grow-1 py-2 fw-bold rounded-pill"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                  color: '#0f172a',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(212,175,55,0.4)',
                }}
                onClick={confirmCancel}
                disabled={cancellingId === cancelTarget._id}
              >
                {cancellingId === cancelTarget._id ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
