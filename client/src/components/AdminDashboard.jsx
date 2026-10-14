import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';

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

export default function AdminDashboard({ user, initialTab = 'rooms' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...emptyRoom });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [roleTarget, setRoleTarget] = useState(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [userActionId, setUserActionId] = useState(null);

  const [inquiries, setInquiries] = useState([]);
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [markingReadId, setMarkingReadId] = useState(null);
  const [deleteInquiryTarget, setDeleteInquiryTarget] = useState(null);
  const [inquiryActionId, setInquiryActionId] = useState(null);
  const [processingRefundId, setProcessingRefundId] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
      const [roomsRes, resRes, usersRes, inquiriesRes] = await Promise.all([
        API.get('/rooms'),
        API.get('/reservations'),
        API.get('/admin/users'),
        API.get('/inquiries'),
      ]);
      setRooms(roomsRes.data);
      setReservations(resRes.data);
      setUsers(usersRes.data);
      setInquiries(inquiriesRes.data);
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

  const handleDelete = (room) => {
    setDeleteTarget(room);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const roomId = deleteTarget._id;
    try {
      setActionId(roomId);
      await API.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      if (editingId === roomId) resetForm();
      showToast('Room deleted successfully.', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete room.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const confirmRestore = async () => {
    try {
      setRestoring(true);
      const res = await API.post('/rooms/restore-defaults');
      setRooms(res.data.rooms || []);
      showToast(res.data.message || 'Default rooms restored successfully.', 'success');
      setRestoreConfirm(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to restore default rooms.', 'error');
    } finally {
      setRestoring(false);
    }
  };

  const handleRoleChange = (targetUser, newRole) => {
    setRoleTarget({ user: targetUser, newRole });
  };

  const confirmRoleChange = async () => {
    if (!roleTarget) return;
    const { user: targetUser, newRole } = roleTarget;
    try {
      setUserActionId(targetUser._id);
      await API.put(`/admin/users/${targetUser._id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
      );
      showToast(
        `${targetUser.firstName} ${targetUser.lastName} is now ${newRole}.`,
        'success'
      );
      setRoleTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user role.', 'error');
    } finally {
      setUserActionId(null);
    }
  };

  const handleToggleActive = async (targetUser) => {
    try {
      setUserActionId(targetUser._id);
      await API.put(`/admin/users/${targetUser._id}/toggle-active`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUser._id ? { ...u, isActive: !u.isActive } : u
        )
      );
      showToast(
        targetUser.isActive
          ? `${targetUser.firstName}'s account has been suspended.`
          : `${targetUser.firstName}'s account has been reactivated.`,
        targetUser.isActive ? 'warning' : 'success'
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update account status.', 'error');
    } finally {
      setUserActionId(null);
    }
  };

  const handleDeleteUser = (targetUser) => {
    setDeleteUserTarget(targetUser);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserTarget) return;
    try {
      setUserActionId(deleteUserTarget._id);
      await API.delete(`/admin/users/${deleteUserTarget._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteUserTarget._id));
      showToast('User deleted successfully.', 'success');
      setDeleteUserTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user.', 'error');
    } finally {
      setUserActionId(null);
    }
  };

  const confirmDeleteInquiry = async () => {
    if (!deleteInquiryTarget) return;
    try {
      setInquiryActionId(deleteInquiryTarget._id);
      await API.delete(`/inquiries/${deleteInquiryTarget._id}`);
      setInquiries((prev) => prev.filter((i) => i._id !== deleteInquiryTarget._id));
      if (activeInquiry && activeInquiry._id === deleteInquiryTarget._id) {
        setActiveInquiry(null);
      }
      showToast('Inquiry deleted successfully.', 'success');
      setDeleteInquiryTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete inquiry.', 'error');
    } finally {
      setInquiryActionId(null);
    }
  };

  const handleProcessRefund = async (reservationId) => {
    try {
      setProcessingRefundId(reservationId);
      const res = await API.patch(`/reservations/${reservationId}/refund`);
      setReservations((prev) =>
        prev.map((r) =>
          r._id === reservationId
            ? { ...r, paymentStatus: 'refunded', refundDetails: res.data?.reservation?.refundDetails || r.refundDetails }
            : r
        )
      );
      showToast('Refund processed successfully. Guest has been notified.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process refund.', 'error');
    } finally {
      setProcessingRefundId(null);
    }
  };

  const openInquiry = async (inquiry) => {
    setActiveInquiry(inquiry);
    setReplyMessage(inquiry.replyMessage || '');
    if (inquiry.status === 'unread') {
      try {
        setMarkingReadId(inquiry._id);
        await API.patch(`/inquiries/${inquiry._id}/read`);
        setInquiries((prev) =>
          prev.map((i) => (i._id === inquiry._id ? { ...i, status: 'read' } : i))
        );
        setActiveInquiry((prev) => (prev && prev._id === inquiry._id ? { ...prev, status: 'read' } : prev));
      } catch (err) {
        showToast('Failed to mark message as read.', 'error');
      } finally {
        setMarkingReadId(null);
      }
    }
  };

  const sendReply = async () => {
    if (!activeInquiry || !replyMessage.trim()) return;
    try {
      setReplying(true);
      const res = await API.post(`/inquiries/${activeInquiry._id}/reply`, {
        replyMessage: replyMessage.trim(),
      });
      setInquiries((prev) =>
        prev.map((i) => (i._id === activeInquiry._id ? res.data.inquiry : i))
      );
      setActiveInquiry(res.data.inquiry);
      showToast('Reply sent successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send reply.', 'error');
    } finally {
      setReplying(false);
    }
  };

  const totalRevenue = reservations
    .filter((r) => r.status === 'Confirmed')
    .reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

  const confirmedCount = reservations.filter((r) => r.status === 'Confirmed').length;

  const unreadCount = inquiries.filter((i) => i.status === 'unread').length;

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      return (
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const navBtn = (tab, label, icon) => (
    <button
      className={`btn rounded-pill px-4 py-2 fw-bold ${
        activeTab === tab ? 'btn-dark' : 'btn-link text-muted text-decoration-none'
      }`}
      onClick={() => setActiveTab(tab)}
    >
      {icon} {label}
    </button>
  );

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
            Manage rooms, oversee reservations, and administer user accounts
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
              className="d-flex gap-2 mb-4 p-2 bg-white rounded-4 shadow-sm flex-wrap"
              style={{ width: 'fit-content' }}
            >
              {navBtn('rooms', 'Room Management', '🛏️')}
              {navBtn('reservations', 'Reservation Oversight', '📋')}
              {navBtn('users', 'User Management', '👥')}
              <button
                className={`btn rounded-pill px-4 py-2 fw-bold position-relative ${
                  activeTab === 'inquiries' ? 'btn-dark' : 'btn-link text-muted text-decoration-none'
                }`}
                onClick={() => setActiveTab('inquiries')}
              >
                💬 Inquiries
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'rooms' && (
              <div className="animate-fade-in">
                <div className="d-flex justify-content-end mb-3">
                  <button
                    className="btn btn-warning fw-bold rounded-pill px-4 py-2"
                    onClick={() => setRestoreConfirm(true)}
                    disabled={restoring}
                    style={{ color: '#0f172a' }}
                  >
                    {restoring ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Restoring...
                      </>
                    ) : (
                      <>♻️ Restore Default Rooms</>
                    )}
                  </button>
                </div>
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
                            No rooms in inventory yet. Add your first room using the form, or click "Restore Default Rooms".
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
                                        onClick={() => handleDelete(room)}
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
                              <th>Payment &amp; Refund</th>
                              <th className="text-end pe-4">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reservations.map((r) => {
                              const methodLabel = { card: 'Card', ewallet: 'E-Wallet', cash: 'Cash', arrival: 'Cash', gcash: 'E-Wallet' }[r.paymentMethod] || r.paymentMethod || 'N/A';
                              const isOnline = r.paymentMethod === 'card' || r.paymentMethod === 'ewallet' || r.paymentMethod === 'gcash';
                              const refundBadge = r.paymentStatus === 'refund_requested' ? (
                                <span className="badge rounded-pill px-2 py-1 fw-bold me-1" style={{ background: 'rgba(251,191,36,0.15)', color: '#d97706', border: '1px solid rgba(251,191,36,0.4)' }}>
                                  Refund Requested
                                </span>
                              ) : r.paymentStatus === 'refunded' ? (
                                <span className="badge rounded-pill px-2 py-1 fw-bold me-1" style={{ background: 'rgba(34,197,94,0.15)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.4)' }}>
                                  Refunded
                                </span>
                              ) : null;
                              return (
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
                                <td>
                                  <div className="d-flex flex-column gap-1">
                                    <div className="d-flex flex-wrap gap-1 align-items-center">
                                      <span
                                        className="badge rounded-pill px-2 py-1 fw-bold"
                                        style={{
                                          background: isOnline ? 'rgba(212,175,55,0.15)' : 'rgba(148,163,184,0.15)',
                                          color: isOnline ? '#d4af37' : '#64748b',
                                          border: `1px solid ${isOnline ? 'rgba(212,175,55,0.4)' : 'rgba(148,163,184,0.4)'}`,
                                        }}
                                      >
                                        {methodLabel}
                                      </span>
                                      {refundBadge}
                                    </div>
                                    {r.paymentStatus === 'refund_requested' && (
                                      <button
                                        className="btn btn-sm rounded-pill fw-bold py-1 px-3"
                                        style={{
                                          background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
                                          color: '#0f172a',
                                          border: 'none',
                                          fontSize: '0.75rem',
                                        }}
                                        onClick={() => handleProcessRefund(r._id)}
                                        disabled={processingRefundId === r._id}
                                      >
                                        {processingRefundId === r._id ? (
                                          <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                            Processing...
                                          </>
                                        ) : (
                                          'Process Refund'
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="text-end pe-4 fw-bold">
                                  {formatCurrency(r.totalAmount)}
                                </td>
                              </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="table-light fw-bold">
                            <tr>
                              <td colSpan="6" className="ps-4 text-end">
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

            {activeTab === 'users' && (
              <div className="animate-fade-in">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div
                    className="card-header border-0 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                      borderRadius: '16px 16px 0 0',
                    }}
                  >
                    <h5 className="mb-0 fw-bold">👥 Registered Users ({users.length})</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3 mb-3">
                      <div className="col-md-8">
                        <div className="input-group">
                          <span className="input-group-text bg-light">🔍</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name or email..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <select
                          className="form-select"
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value)}
                        >
                          <option value="all">All Roles</option>
                          <option value="guest">Guests</option>
                          <option value="admin">Admins</option>
                        </select>
                      </div>
                    </div>

                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        No users match your search criteria.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="ps-4">Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Role</th>
                              <th>Status</th>
                              <th>Registered</th>
                              <th className="text-end pe-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((u) => (
                              <tr key={u._id}>
                                <td className="ps-4 fw-semibold">
                                  {u.firstName} {u.lastName}
                                </td>
                                <td>{u.email}</td>
                                <td>
                                  {u.phone ? `${u.phone.countryCode} ${u.phone.number}` : 'N/A'}
                                </td>
                                <td>
                                  <span
                                    className={`badge rounded-pill px-3 py-2 fw-bold ${
                                      u.role === 'admin' ? 'bg-dark' : 'bg-secondary'
                                    }`}
                                  >
                                    {u.role}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge rounded-pill px-3 py-2 fw-bold ${
                                      u.isActive === false ? 'bg-danger' : 'bg-success'
                                    }`}
                                  >
                                    {u.isActive === false ? 'Suspended' : 'Active'}
                                  </span>
                                </td>
                                <td>{formatDate(u.createdAt)}</td>
                                <td className="text-end pe-4">
                                  {u.role === 'guest' ? (
                                    <button
                                      className="btn btn-sm btn-outline-dark rounded-pill me-2"
                                      onClick={() => handleRoleChange(u, 'admin')}
                                      disabled={userActionId === u._id}
                                      title="Promote to Admin"
                                    >
                                      ⬆️ Promote
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-sm btn-outline-secondary rounded-pill me-2"
                                      onClick={() => handleRoleChange(u, 'guest')}
                                      disabled={userActionId === u._id}
                                      title="Demote to Guest"
                                    >
                                      ⬇️ Demote
                                    </button>
                                  )}
                                  <button
                                    className={`btn btn-sm rounded-pill me-2 ${
                                      u.isActive === false
                                        ? 'btn-outline-success'
                                        : 'btn-outline-warning'
                                    }`}
                                    onClick={() => handleToggleActive(u)}
                                    disabled={userActionId === u._id}
                                    title={u.isActive === false ? 'Reactivate account' : 'Suspend account'}
                                  >
                                    {u.isActive === false ? '✅ Activate' : '🚫 Suspend'}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger rounded-pill"
                                    onClick={() => handleDeleteUser(u)}
                                    disabled={userActionId === u._id}
                                    title="Delete user"
                                  >
                                    🗑️
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
            )}

            {activeTab === 'inquiries' && (
              <div className="animate-fade-in">
                <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                  <div
                    className="card-header border-0 text-white d-flex justify-content-between align-items-center flex-wrap gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    }}
                  >
                    <h5 className="mb-0 fw-bold">💬 Guest Inquiries ({inquiries.length})</h5>
                    <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(212,175,55,0.25)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.5)' }}>
                      {unreadCount} Unread
                    </span>
                  </div>
                  <div className="card-body p-0">
                    {inquiries.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        No guest inquiries yet.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="ps-4">Guest Name</th>
                              <th>Email</th>
                              <th>Date</th>
                              <th>Preview</th>
                              <th>Status</th>
                              <th className="text-end pe-4">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inquiries.map((inquiry) => (
                              <tr key={inquiry._id} style={inquiry.status === 'unread' ? { background: 'rgba(212,175,55,0.06)' } : {}}>
                                <td className="ps-4 fw-semibold">{inquiry.name}</td>
                                <td>{inquiry.email}</td>
                                <td>{formatDate(inquiry.createdAt)}</td>
                                <td style={{ maxWidth: '260px' }}>
                                  <div className="text-truncate">{inquiry.message}</div>
                                </td>
                                <td>
                                  <span
                                    className={`badge rounded-pill px-3 py-2 fw-bold ${
                                      inquiry.status === 'unread'
                                        ? 'bg-danger'
                                        : inquiry.status === 'read'
                                        ? 'bg-warning text-dark'
                                        : 'bg-success'
                                    }`}
                                  >
                                    {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                  </span>
                                </td>
                                <td className="text-end pe-4">
                                  <div className="d-flex gap-2 justify-content-end">
                                    <button
                                      className="btn btn-sm rounded-pill fw-bold"
                                      style={{
                                        background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
                                        color: '#0f172a',
                                        border: 'none',
                                      }}
                                      onClick={() => openInquiry(inquiry)}
                                      disabled={markingReadId === inquiry._id}
                                    >
                                      {markingReadId === inquiry._id ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                          Opening...
                                        </>
                                      ) : (
                                        'Open Message'
                                      )}
                                    </button>
                                    <button
                                      className="btn btn-sm rounded-pill fw-bold"
                                      style={{
                                        background: 'rgba(220,53,69,0.1)',
                                        color: '#dc3545',
                                        border: '1px solid rgba(220,53,69,0.3)',
                                      }}
                                      onClick={() => setDeleteInquiryTarget(inquiry)}
                                      disabled={inquiryActionId === inquiry._id}
                                      title="Delete inquiry"
                                    >
                                      {inquiryActionId === inquiry._id ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                      ) : (
                                        '🗑️ Delete'
                                      )}
                                    </button>
                                  </div>
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
            )}
          </>
        )}
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Room"
        icon="🗑️"
        danger
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.type} (Room #${deleteTarget.roomNumber})? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Room"
        cancelText="Keep Room"
        loading={!!deleteTarget && actionId === deleteTarget._id}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        show={restoreConfirm}
        title="Restore Default Rooms"
        icon="♻️"
        message="This will permanently remove all current rooms and replace them with the 4 default luxury suites (Deluxe Ocean View Suite, Premier Beachfront Villa, Presidential Bay Suite, Executive Garden Villa). This cannot be undone."
        confirmText="Restore Defaults"
        cancelText="Cancel"
        loading={restoring}
        onConfirm={confirmRestore}
        onCancel={() => setRestoreConfirm(false)}
      />

      <ConfirmModal
        show={!!roleTarget}
        title={roleTarget?.newRole === 'admin' ? 'Promote to Admin' : 'Demote to Guest'}
        icon={roleTarget?.newRole === 'admin' ? '⬆️' : '⬇️'}
        danger={roleTarget?.newRole === 'admin'}
        message={
          roleTarget
            ? `Are you sure you want to ${roleTarget.newRole === 'admin' ? 'promote' : 'demote'} ${roleTarget.user.firstName} ${roleTarget.user.lastName} to ${roleTarget.newRole}?`
            : ''
        }
        confirmText={roleTarget?.newRole === 'admin' ? 'Promote to Admin' : 'Demote to Guest'}
        cancelText="Cancel"
        loading={!!roleTarget && userActionId === roleTarget.user._id}
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleTarget(null)}
      />

      <ConfirmModal
        show={!!deleteUserTarget}
        title="Delete User"
        icon="🗑️"
        danger
        message={
          deleteUserTarget
            ? `Are you sure you want to permanently delete ${deleteUserTarget.firstName} ${deleteUserTarget.lastName} (${deleteUserTarget.email})? This action cannot be undone.`
            : ''
        }
        confirmText="Delete User"
        cancelText="Cancel"
        loading={!!deleteUserTarget && userActionId === deleteUserTarget._id}
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteUserTarget(null)}
      />

      <ConfirmModal
        show={!!deleteInquiryTarget}
        title="Delete Inquiry"
        icon="🗑️"
        danger
        message={
          deleteInquiryTarget
            ? `Are you sure you want to delete this inquiry from ${deleteInquiryTarget.name} (${deleteInquiryTarget.email})? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Inquiry"
        cancelText="Cancel"
        loading={!!deleteInquiryTarget && inquiryActionId === deleteInquiryTarget._id}
        onConfirm={confirmDeleteInquiry}
        onCancel={() => setDeleteInquiryTarget(null)}
      />

      {activeInquiry && (
        <div
          onClick={() => setActiveInquiry(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(212,175,55,0.35)',
              boxShadow: '0 25px 70px rgba(0,0,0,0.45)',
              color: '#0f172a',
            }}
          >
            <div
              className="d-flex justify-content-between align-items-center p-4"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                borderRadius: '20px 20px 0 0',
                color: '#fff',
              }}
            >
              <div>
                <h5 className="mb-0 fw-bold">Guest Message</h5>
                <small style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {activeInquiry.name} • {activeInquiry.email}
                </small>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setActiveInquiry(null)}
                aria-label="Close"
              />
            </div>

            <div className="p-4">
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span
                  className={`badge rounded-pill px-3 py-2 fw-bold ${
                    activeInquiry.status === 'unread'
                      ? 'bg-danger'
                      : activeInquiry.status === 'read'
                      ? 'bg-warning text-dark'
                      : 'bg-success'
                  }`}
                >
                  {activeInquiry.status.charAt(0).toUpperCase() + activeInquiry.status.slice(1)}
                </span>
                <small className="text-muted">
                  Received {new Date(activeInquiry.createdAt).toLocaleString()}
                </small>
              </div>

              <div
                className="p-3 mb-4"
                style={{
                  background: 'rgba(15,23,42,0.04)',
                  borderRadius: '12px',
                  borderLeft: '3px solid #d4af37',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {activeInquiry.message}
              </div>

              {activeInquiry.replyMessage && (
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold text-uppercase mb-1">
                    Previous Reply
                  </label>
                  <div
                    className="p-3"
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      borderRadius: '12px',
                      borderLeft: '3px solid #10b981',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                    }}
                  >
                    {activeInquiry.replyMessage}
                    {activeInquiry.repliedAt && (
                      <div className="mt-2 text-muted small">
                        Replied {new Date(activeInquiry.repliedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label text-muted small fw-bold text-uppercase">
                  {activeInquiry.replyMessage ? 'Update Reply' : 'Admin Reply'}
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply to the guest..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn flex-grow-1 py-2 fw-bold rounded-pill"
                  style={{
                    background: 'rgba(15,23,42,0.08)',
                    color: '#0f172a',
                    border: '1px solid rgba(15,23,42,0.15)',
                  }}
                  onClick={() => setActiveInquiry(null)}
                  disabled={replying}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn flex-grow-1 py-2 fw-bold rounded-pill"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 100%)',
                    color: '#0f172a',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(212,175,55,0.4)',
                  }}
                  onClick={sendReply}
                  disabled={replying || !replyMessage.trim()}
                >
                  {replying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    'Send Reply'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
