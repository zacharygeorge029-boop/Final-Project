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

  const handleCancel = async (reservationId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setCancellingId(reservationId);
      await API.put(`/reservations/${reservationId}/cancel`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === reservationId ? { ...b, status: 'Cancelled' } : b
        )
      );
      showToast('Reservation cancelled successfully.', 'success');
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

                    {booking.status === 'Confirmed' ? (
                      <button
                        className="btn btn-outline-danger w-100 py-2 fw-bold rounded-pill"
                        onClick={() => handleCancel(booking._id)}
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
    </div>
  );
}
