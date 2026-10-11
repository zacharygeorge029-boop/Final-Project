import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount) =>
  `$${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const emptyRoom = {
  roomNumber: '',
  type: '',
  pricePerNight: '',
  capacity: '',
  description: '',
  amenities: '',
  image: '',
};

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...emptyRoom });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionId, setActionId] = useState(null);
  const { showToast } = useToast();

  if (!user || user.role !== 'admin') {
    return (
      <div className="animate-fade-in d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="display-1 mb-4">🔒</div>
          <h2 className="fw-bold text-dark">Access Denied</h2>
          <p className="text-muted">You do not have permission to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [roomsRes, resRes] = await Promise.all([
        API.get('/rooms'),
        API.get('/reservations'),
      ]);
      setRooms(roomsRes.data);
      setReservations(resRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyRoom });
    setEditingId(null);
    setFormError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (room) => {
    setForm({
      roomNumber: room.roomNumber || '',
      type: room.type || '',
      pricePerNight: room.pricePerNight || '',
      capacity: room.capacity || '',
      description: room.description || '',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      image: room.image || '',
    });
    setEditingId(room._id);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.roomNumber || !form.type || !form.pricePerNight || !form.capacity) {
      setFormError('Room number, type, price per night, and capacity are required.');
      return;
    }

    const payload = {
      roomNumber: form.roomNumber.trim(),
      type: form.type.trim(),
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      description: form.description.trim(),
      amenities: form.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      image: form.image.trim(),
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await API.put(`/rooms/${editingId}`, payload);
        showToast('Room updated successfully.', 'success');
      } else {
        await API.post('/rooms', payload);
        showToast('Room added successfully.', 'success');
      }
      resetForm();
      await fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save room.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (roomId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this room? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setActionId(roomId);
      await API.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      if (editingId === roomId) resetForm();
      showToast('Room deleted successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete room.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const totalRevenue = reservations
    .filter((r) => r.status === 'Confirmed')
    .reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

  const confirmedCount = reservations.filter((r) => r.status === 'Confirmed').length;

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div
        className="text-center text-white py-5 mb-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.88)), url("https://i.pinimg.com/1200x/2f/c6/b6/2fc6b619bb0af3dc94971c099d25bbae.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container animate-slide-up">
          <span className="badge bg-warning text-dark mb-3 px-3 py-2 fw-bold text-uppercase rounded-pill">
            Admin Control Panel
          </span>
          <h1 className="display-5 fw-bold mb-2">Dashboard</h1>
          <p className="lead mb-0" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Manage rooms and oversee all guest reservations
          </p>
        </div>
      </div>

      <div className="container pb-5">
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading dashboard...</p>
          </div>
        )}

        {!loading && error && <div className="alert alert-danger text-center">{error}</div>}

        {!loading && !error && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px' }}>
                  <div className="card-body text-center">
                    <div className="fs-2 mb-2">🛏️</div>
                    <div className="text-muted small fw-bold text-uppercase">Total Rooms</div>
                    <div className="display-6 fw-bold text-dark">{rooms.length}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px' }}>
                  <div className="card-body text-center">
                    <div className="fs-2 mb-2">✅</div>
                    <div className="text-muted small fw-bold text-uppercase">Confirmed Bookings</div>
                    <div className="display-6 fw-bold text-dark">{confirmedCount}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px' }}>
                  <div className="card-body text-center">
                    <div className="fs-2 mb-2">💰</div>
                    <div className="text-muted small fw-bold text-uppercase">Total Revenue</div>
                    <div className="display-6 fw-bold text-dark">{formatCurrency(totalRevenue)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="d-flex gap-2 mb-4 p-2 bg-white rounded-4 shadow-sm"
              style={{ width: 'fit-content' }}
            >
              <button
                className={`btn rounded-pill px-4 py-2 fw-bold ${
                  activeTab === 'rooms' ? 'btn-dark' : 'btn-link text-muted text-decoration-none'
                }`}
                onClick={() => setActiveTab('rooms')}
              >
                🛏️ Room Management
              </button>
              <button
                className={`btn rounded-pill px-4 py-2 fw-bold ${
                  activeTab === 'reservations' ? 'btn-dark' : 'btn-link text-muted text-decoration-none'
                }`}
                onClick={() => setActiveTab('reservations')}
              >
                📋 Reservation Oversight
              </button>
            </div>

            {activeTab === 'rooms' && (
              <div className="animate-fade-in">
                <div className="row g-4">
                  <div className="col-lg-5">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                      <div
                        className="card-header border-0 text-white"
                        style={{
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                          borderRadius: '16px 16px 0 0',
                        }}
                      >
                        <h5 className="mb-0 fw-bold">
                          {editingId ? '✏️ Edit Room' : '➕ Add New Room'}
                        </h5>
                      </div>
                      <div className="card-body p-4">
                        {formError && <div className="alert alert-danger">{formError}</div>}
                        <form onSubmit={handleSubmit}>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted small fw-bold text-uppercase">
                                Room Number *
                              </label>
                              <input
                                type="text"
                                name="roomNumber"
                                className="form-control"
                                value={form.roomNumber}
                                onChange={handleInputChange}
                                placeholder="e.g. 101"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small fw-bold text-uppercase">
                                Type *
                              </label>
                              <input
                                type="text"
                                name="type"
                                className="form-control"
                                value={form.type}
                                onChange={handleInputChange}
                                placeholder="Deluxe Ocean Room"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small fw-bold text-uppercase">
                                Price/Night ($) *
                              </label>
                              <input
                                type="number"
                                name="pricePerNight"
                                className="form-control"
                                value={form.pricePerNight}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small fw-bold text-uppercase">
                                Capacity *
                              </label>
                              <input
                                type="number"
                                name="capacity"
                                className="form-control"
                                value={form.capacity}
                                onChange={handleInputChange}
                                min="1"
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label text-muted small fw-bold text-uppercase">
                                Description
                              </label>
                              <textarea
                                name="description"
                                className="form-control"
                                rows="2"
                                value={form.description}
                                onChange={handleInputChange}
                                placeholder="A short description of the room..."
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label text-muted small fw-bold text-uppercase">
                                Amenities (comma-separated)
                              </label>
                              <input
                                type="text"
                                name="amenities"
                                className="form-control"
                                value={form.amenities}
                                onChange={handleInputChange}
                                placeholder="WiFi, Ocean View, Mini Bar"
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label text-muted small fw-bold text-uppercase">
                                Image URL
                              </label>
                              <input
                                type="text"
                                name="image"
                                className="form-control"
                                value={form.image}
                                onChange={handleInputChange}
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                          <div className="d-flex gap-2 mt-4">
                            <button
                              type="submit"
                              className="btn btn-dark flex-grow-1 py-2 fw-bold rounded-pill"
                              disabled={submitting}
                            >
                              {submitting ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Saving...
                                </>
                              ) : editingId ? (
                                'Update Room'
                              ) : (
                                'Add Room'
                              )}
                            </button>
                            {editingId && (
                              <button
                                type="button"
                                className="btn btn-outline-secondary px-4 py-2 fw-bold rounded-pill"
                                onClick={resetForm}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-7">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                      <div
                        className="card-header border-0 text-white"
                        style={{
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                          borderRadius: '16px 16px 0 0',
                        }}
                      >
                        <h5 className="mb-0 fw-bold">🏨 Room Inventory ({rooms.length})</h5>
                      </div>
                      <div className="card-body p-0">
                        {rooms.length === 0 ? (
                          <div className="text-center py-5 text-muted">
                            No rooms in inventory yet. Add your first room using the form.
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th className="ps-4">Room</th>
                                  <th>Type</th>
                                  <th>Price/Night</th>
                                  <th>Capacity</th>
                                  <th className="text-end pe-4">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rooms.map((room) => (
                                  <tr key={room._id}>
                                    <td className="ps-4 fw-semibold">#{room.roomNumber}</td>
                                    <td>{room.type}</td>
                                    <td>{formatCurrency(room.pricePerNight)}</td>
                                    <td>{room.capacity}</td>
                                    <td className="text-end pe-4">
                                      <button
                                        className="btn btn-sm btn-outline-dark rounded-pill me-2"
                                        onClick={() => startEdit(room)}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                        onClick={() => handleDelete(room._id)}
                                        disabled={actionId === room._id}
                                      >
                                        {actionId === room._id ? '...' : 'Delete'}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reservations' && (
              <div className="animate-fade-in">
                <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                  <div
                    className="card-header border-0 text-white d-flex justify-content-between align-items-center flex-wrap gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    }}
                  >
                    <h5 className="mb-0 fw-bold">📋 All Guest Reservations ({reservations.length})</h5>
                    <span className="badge bg-success rounded-pill px-3 py-2">
                      Revenue: {formatCurrency(totalRevenue)}
                    </span>
                  </div>
                  <div className="card-body p-0">
                    {reservations.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        No reservations have been made yet.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="ps-4">Guest</th>
                              <th>Room</th>
                              <th>Check-in</th>
                              <th>Check-out</th>
                              <th>Status</th>
                              <th className="text-end pe-4">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reservations.map((r) => (
                              <tr key={r._id}>
                                <td className="ps-4">
                                  <div className="fw-semibold">{r.user ? `${r.user.firstName} ${r.user.lastName}`.trim() : 'Unknown Guest'}</div>
                                  <div className="small text-muted">{r.user?.email}</div>
                                </td>
                                <td>
                                  <div className="fw-semibold">{r.room?.type || 'N/A'}</div>
                                  <div className="small text-muted">
                                    {r.room?.roomNumber ? `Room #${r.room.roomNumber}` : ''}
                                  </div>
                                </td>
                                <td>{formatDate(r.checkInDate)}</td>
                                <td>{formatDate(r.checkOutDate)}</td>
                                <td>
                                  <span
                                    className={`badge rounded-pill px-3 py-2 fw-bold ${
                                      r.status === 'Confirmed' ? 'bg-success' : 'bg-secondary'
                                    }`}
                                  >
                                    {r.status}
                                  </span>
                                </td>
                                <td className="text-end pe-4 fw-bold">
                                  {formatCurrency(r.totalAmount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-light fw-bold">
                            <tr>
                              <td colSpan="5" className="ps-4 text-end">
                                Total Confirmed Revenue:
                              </td>
                              <td className="text-end pe-4 text-success">
                                {formatCurrency(totalRevenue)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
