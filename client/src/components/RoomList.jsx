import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import BackToTop from './BackToTop';

const todayISO = () => new Date().toISOString().split('T')[0];

const formatCurrency = (amount) =>
  `₱${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const SkeletonCard = () => (
  <div className="col-md-4 mb-4">
    <div className="room-card h-100">
      <div className="skeleton" style={{ height: '220px', width: '100%' }} />
      <div className="p-4">
        <div className="skeleton skeleton-line" style={{ width: '70%' }} />
        <div className="skeleton skeleton-line short" />
        <div className="d-flex gap-2 mb-3">
          <div className="skeleton" style={{ height: '22px', width: '70px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '22px', width: '70px', borderRadius: '12px' }} />
        </div>
        <div className="skeleton skeleton-line" />
        <div className="d-flex gap-2 mt-3">
          <div className="skeleton" style={{ height: '38px', flex: 1, borderRadius: '8px' }} />
          <div className="skeleton" style={{ height: '38px', flex: 1, borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  </div>
);

const ROOM_CATEGORIES = [
  'All Rooms',
  'Deluxe Ocean Room',
  'Executive Suite',
  'Presidential Villa',
  'Beachfront Villa',
  'Garden Suite',
  'Ocean View Suite',
  'Family Room',
  'Luxury Penthouse',
  'Pool Villa',
  'Cocoa Pod Suite',
];

const HERO_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTkv9liNysUaIUcXrZViJvpFBlkA9TlCsH7IPmW6Lhd6lxs3knZgq2gKQ&s=10',
  'https://cf.bstatic.com/xdata/images/hotel/max1024x768/290376069.jpg?k=d286ec60cc4e64cd594d45a2c45e8cd8244903f6b2b6828d36be049d592e795c&o=',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT34cwECAtkWsSA-tcgL8JlP2ZufSEui-RjFefaX4Uxda2dgx34kNc-HQw&s=10',
  'https://pix10.agoda.net/hotelImages/736975/3381239/e48e996f8d672edbc5cb5b69c8f57401.jpg?ce=3&s=414x232',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dpPVPO13d57uAK6RpFWTTOjiIBxpJ0OtUsFbUtUp3Sepg0kUk3X771V3&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPKm2expD_YRNsvxrWeHbXsYnkX7LNLMJG56WOoPWkzM-K16NpnIDjvGE&s=10',
  'https://q-xx.bstatic.com/xdata/images/hotel/max500/653993707.jpg?k=e3ef1f6571152be52079bc54fddd87d261d4bfd3af2644fbf6bf1db52c40d8b9&o=',
  'https://cdn.webhotelier.net/photos/w=1920/bluebayr-luxpp/L569294.jpg',
  'https://image-tc.galaxy.tf/wijpeg-c7kde2n8v1we83al1lzwuysbn/whatsapp-image-2026-09-23-at-2-34-27-pm_standard.jpg?crop=200%2C0%2C1200%2C900',
  'https://image-tc.galaxy.tf/wijpeg-1v4uhw6nek1jstwdwasn5ov19/cocoa-pod-suite-bedroom_standard.jpg?crop=106%2C0%2C1688%2C1266',
];

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Pay Upon Arrival', icon: '🏨' },
  { id: 'card', label: 'Credit Card', icon: '💳' },
  { id: 'ewallet', label: 'GCash / E-Wallet', icon: '📱' },
];

const STAY_ADDONS = [
  { id: 'airport', name: 'Airport Transfer', price: 2500, icon: '🚐', perNight: false, desc: 'Private round-trip airport transfer' },
  { id: 'champagne', name: 'Welcome Champagne & Fruit Basket', price: 1800, icon: '🍾', perNight: false, desc: 'Premium champagne & seasonal fruit' },
  { id: 'spa', name: 'Sunset Spa Package', price: 3500, icon: '💆', perNight: false, desc: 'Signature 90-min couples spa session' },
  { id: 'breakfast', name: 'Daily Beachfront Breakfast', price: 1200, icon: '🍳', perNight: true, desc: 'Gourmet breakfast each morning' },
];

const GOLD_GRADIENT = 'linear-gradient(135deg, #d4af37 0%, #f5d76e 100%)';
const NAVY = '#0f172a';
const GOLD = '#d4af37';

export default function RoomList({ user, onNavigateLogin, bookingParams }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState('2');
  const [category, setCategory] = useState('All Rooms');
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [message, setMessage] = useState('');
  const [detailsRoom, setDetailsRoom] = useState(null);
  const [detailsImageIndex, setDetailsImageIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('arrival');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    API.get('/rooms')
      .then((res) => setRooms(res.data))
      .catch(() => showToast('Failed to load rooms. Please try again.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    socket.on('room_inventory_updated', ({ roomId, availableQuantity }) => {
      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, availableQuantity } : r))
      );
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let source = bookingParams;
    if (!source) {
      try {
        const saved = localStorage.getItem('capipisa_booking_search');
        if (saved) source = JSON.parse(saved);
      } catch (e) { /* ignore */ }
    }
    if (source) {
      if (source.checkIn) setCheckIn(source.checkIn);
      if (source.checkOut) setCheckOut(source.checkOut);
      if (source.guests) setGuestCount(String(source.guests));
    }
  }, [bookingParams]);

  const today = todayISO();

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(diff));
  }, [checkIn, checkOut]);

  const addonObjects = useMemo(
    () => STAY_ADDONS.filter((a) => selectedAddons.includes(a.id)),
    [selectedAddons]
  );

  const addonsTotal = useMemo(
    () => addonObjects.reduce((sum, a) => sum + (a.perNight ? a.price * nights : a.price), 0),
    [addonObjects, nights]
  );

  const toggleAddon = (id) => {
    setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCheckInChange = (value) => {
    setCheckIn(value);
    if (checkOut && new Date(checkOut) <= new Date(value)) {
      setCheckOut('');
    }
  };

  const handleApply = () => {
    if (!checkIn || !checkOut) {
      showToast('Please select both check-in and check-out dates.', 'warning');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      showToast('Check-out date must be after check-in date.', 'warning');
      return;
    }
    try {
      localStorage.setItem('capipisa_booking_search', JSON.stringify({ checkIn, checkOut, guests: guestCount }));
    } catch (e) { /* ignore */ }
    setFiltering(true);
    setFiltersApplied(true);
    setTimeout(() => {
      setFiltering(false);
      showToast('Filters applied! Browse your available rooms below.', 'success');
    }, 450);
  };

  const resetFilters = () => {
    setCheckIn('');
    setCheckOut('');
    setGuestCount('2');
    setCategory('All Rooms');
    setFiltersApplied(false);
    showToast('Filters reset. Showing all available rooms.', 'success');
  };

  const filteredRooms = rooms.filter((room) => {
    if (category !== 'All Rooms' && room.type !== category) return false;
    if (filtersApplied && room.capacity < Number(guestCount)) return false;
    return true;
  });

  const openDetails = (room) => {
    setDetailsRoom(room);
    setDetailsImageIndex(0);
  };

  const openBookingDrawer = (room) => {
    if (!user) {
      showToast('Please sign in to book a room.', 'warning');
      onNavigateLogin();
      return;
    }
    if (!checkIn || !checkOut) {
      showToast('Please select your check-in and check-out dates first!', 'warning');
      return;
    }
    if (nights <= 0) {
      showToast('Check-out date must be after check-in date.', 'warning');
      return;
    }
    setGuestForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: '',
      specialRequests: '',
    });
    setPaymentMethod('cash');
    setSelectedAddons([]);
    setBookingRoom(room);
  };

  const confirmBooking = async () => {
    if (!bookingRoom) return;
    if (!guestForm.firstName.trim() || !guestForm.lastName.trim() || !guestForm.email.trim()) {
      showToast('Please provide your name and email to complete the booking.', 'warning');
      return;
    }
    const roomTotal = nights * bookingRoom.pricePerNight;
    const totalAmount = roomTotal + addonsTotal;
    try {
      setSubmittingBooking(true);
      const payload = {
        room: bookingRoom._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalAmount,
        roomTotal,
        addonsTotal,
        addons: addonObjects.map((a) => ({ id: a.id, name: a.name, price: a.price, perNight: a.perNight })),
        guestDetails: {
          firstName: guestForm.firstName.trim(),
          lastName: guestForm.lastName.trim(),
          email: guestForm.email.trim(),
          phone: guestForm.phone.trim(),
          specialRequests: guestForm.specialRequests.trim(),
        },
        paymentMethod,
      };
      const res = await API.post('/reservations', payload);
      showToast('Reservation confirmed! We look forward to welcoming you.', 'success');
      setBookingRoom(null);
      setConfirmedBooking({
        ...res.data,
        room: bookingRoom,
        nights,
        roomTotal,
        addonsTotal,
        addons: addonObjects,
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleDownloadVoucher = () => {
    if (!confirmedBooking) return;
    const b = confirmedBooking;
    const roomName = b.room?.type || 'Capipisa Bay Suite';
    const addonLines = (b.addons || []).map((a) =>
      `<tr><td style="padding:8px 0;color:#475569">${a.icon} ${a.name}${a.perNight ? ` × ${b.nights}` : ''}</td><td style="padding:8px 0;text-align:right;color:#0f172a">${formatCurrency(a.perNight ? a.price * b.nights : a.price)}</td></tr>`
    ).join('');
    const guest = b.guestDetails || {};
    const fullName = `${guest.firstName || ''} ${guest.lastName || ''}`.trim();
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>E-Voucher ${b.bookingReference || ''}</title>
<style>
body{font-family:Georgia,'Times New Roman',serif;background:#f8fafc;margin:0;padding:40px;color:#0f172a}
.voucher{max-width:640px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,0.15);border:1px solid rgba(212,175,55,0.3)}
.header{background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px;text-align:center}
.header h1{color:#f5d76e;margin:0 0 6px;font-size:1.6rem;letter-spacing:1px}
.header .ref{color:rgba(255,255,255,0.8);font-size:0.95rem}
.body{padding:32px}
.badge{display:inline-block;background:linear-gradient(135deg,#d4af37,#f5d76e);color:#0f172a;padding:6px 16px;border-radius:20px;font-weight:bold;font-size:0.8rem;letter-spacing:1px;text-transform:uppercase}
h2{color:#0f172a;margin:24px 0 8px;font-size:1.2rem;border-bottom:2px solid rgba(212,175,55,0.3);padding-bottom:8px}
table{width:100%;border-collapse:collapse;font-size:0.95rem}
.label{color:#64748b}
.val{color:#0f172a;font-weight:600}
.total-row{border-top:2px dashed #d4af37}
.footer{background:#f8fafc;padding:24px 32px;text-align:center;color:#64748b;font-size:0.85rem;border-top:1px solid #e2e8f0}
.gold{color:#d4af37}
</style></head><body>
<div class="voucher">
<div class="header">
<h1>✦ CAPIPISA BAY RESORT & HOTEL ✦</h1>
<div class="ref">Booking Confirmation · ${b.bookingReference || 'N/A'}</div>
</div>
<div class="body">
<center><span class="badge">Reservation Confirmed</span></center>
<h2>Guest</h2>
<table>
<tr><td class="label">Name</td><td class="val">${fullName || '—'}</td></tr>
<tr><td class="label">Email</td><td class="val">${guest.email || '—'}</td></tr>
<tr><td class="label">Phone</td><td class="val">${guest.phone || '—'}</td></tr>
</table>
<h2>Stay Details</h2>
<table>
<tr><td class="label">Suite</td><td class="val">${roomName}</td></tr>
<tr><td class="label">Check-In</td><td class="val">${b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : '—'}</td></tr>
<tr><td class="label">Check-Out</td><td class="val">${b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : '—'}</td></tr>
<tr><td class="label">Nights</td><td class="val">${b.nights || 0}</td></tr>
</table>
<h2>Charges</h2>
<table>
<tr><td style="padding:8px 0;color:#475569">Suite (${formatCurrency(b.room?.pricePerNight || 0)} × ${b.nights || 0})</td><td style="padding:8px 0;text-align:right;color:#0f172a">${formatCurrency(b.roomTotal || 0)}</td></tr>
${addonLines}
<tr class="total-row"><td style="padding:10px 0;font-weight:bold;color:#0f172a">Total Amount</td><td style="padding:10px 0;text-align:right;font-weight:bold;color:#d4af37;font-size:1.1rem">${formatCurrency(b.totalAmount || 0)}</td></tr>
</table>
</div>
<div class="footer">
Thank you for choosing Capipisa Bay Resort & Hotel.<br>
A confirmation has been sent to your email. Present this voucher upon arrival.
</div>
</div>
</body></html>`;

    const printWindow = window.open('', '_blank', 'width=820,height=900');
    if (!printWindow) {
      showToast('Please allow pop-ups to download your e-voucher.', 'warning');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const renderBadge = (badge) => {
    if (!badge) return null;
    return (
      <span
        className="badge position-absolute px-3 py-2 fw-bold"
        style={{
          top: '12px',
          left: '12px',
          background: GOLD_GRADIENT,
          color: NAVY,
          borderRadius: '20px',
          fontSize: '0.72rem',
          letterSpacing: '0.5px',
          boxShadow: '0 4px 12px rgba(212,175,55,0.45)',
        }}
      >
        ★ {badge}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      <div
        className="d-flex align-items-center justify-content-center text-center text-white py-5 mb-5 position-relative overflow-hidden"
        style={{ minHeight: '340px' }}
      >
        {HERO_IMAGES.map((img, index) => (
          <div
            key={index}
            className="position-absolute"
            style={{
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url("${img}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
            }}
          />
        ))}
        <div
          className="position-absolute"
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(8,15,30,0.78) 0%, rgba(15,40,70,0.72) 100%)',
          }}
        />
        <div className="container position-relative animate-slide-up" style={{ zIndex: 2 }}>
          <span
            className="badge px-4 py-2 mb-3 fw-bold text-uppercase rounded-pill"
            style={{ background: GOLD_GRADIENT, color: NAVY, letterSpacing: '2px' }}
          >
            ✦ Premium Collection ✦
          </span>
          <h1 className="display-4 fw-bold mb-3" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            Experience <span style={{ color: '#f5d76e' }}>Ultimate Luxury</span>
          </h1>
          <p className="lead mb-0" style={{ color: 'rgba(255,255,255,0.88)', maxWidth: '640px', margin: '0 auto' }}>
            Immerse yourself in elegance, exceptional service, and breathtaking suites tailored for your ultimate coastal getaway.
          </p>
        </div>
      </div>

      <div className="container pb-5">
        <div
          style={{
            position: 'sticky',
            top: '76px',
            zIndex: 900,
            padding: '8px 0 12px',
            marginBottom: '20px',
            background: 'linear-gradient(180deg, rgba(248,249,250,0.96) 0%, rgba(248,249,250,0.92) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="p-4 p-md-4"
            style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(15,23,42,0.12)',
              border: '1px solid rgba(212,175,55,0.2)',
            }}
          >
            <h5 className="mb-4 fw-bold" style={{ color: NAVY }}>
              <span style={{ color: GOLD }}>✦</span> Plan Your Perfect Stay
            </h5>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Check-In</label>
                <div className="position-relative">
                  <span className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: GOLD, fontSize: '1.1rem', pointerEvents: 'none' }}>📅</span>
                  <input
                    type="date"
                    className="form-control"
                    value={checkIn}
                    min={today}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Check-Out</label>
                <div className="position-relative">
                  <span className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: GOLD, fontSize: '1.1rem', pointerEvents: 'none' }}>📅</span>
                  <input
                    type="date"
                    className="form-control"
                    value={checkOut}
                    min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : today}
                    onChange={(e) => setCheckOut(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted small fw-bold text-uppercase">Guests</label>
                <div className="position-relative">
                  <span className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: GOLD, fontSize: '1rem', pointerEvents: 'none', zIndex: 2 }}>👤</span>
                  <select
                    className="form-select"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted small fw-bold text-uppercase">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {ROOM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button
                  className="btn w-100 py-2 fw-bold"
                  onClick={handleApply}
                  disabled={filtering}
                  style={{
                    background: GOLD_GRADIENT,
                    color: NAVY,
                    border: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(212,175,55,0.4)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!filtering) {
                      e.currentTarget.style.boxShadow = '0 6px 22px rgba(212,175,55,0.7)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(212,175,55,0.4)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {filtering ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Searching...
                    </>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="alert alert-success" style={{ borderRadius: '12px' }}>
            {message}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h3 className="fw-bold m-0" style={{ color: NAVY }}>
            Available Rooms & Suites
            {category !== 'All Rooms' && (
              <span className="fs-5 text-muted fw-normal"> · {category}</span>
            )}
          </h3>
          {!loading && (
            <span className="text-muted">
              {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} found
            </span>
          )}
        </div>

        {loading ? (
          <div className="row">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div
            className="text-center py-5"
            style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '16px' }}
          >
            <div className="display-4 mb-3">🛏️</div>
            <h4 className="fw-bold text-dark">No suites available for your selected dates</h4>
            <p className="text-muted mb-4">
              Try adjusting your dates or viewing all suites.
            </p>
            <button
              className="btn fw-bold rounded-pill px-4 py-2"
              onClick={resetFilters}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 100%)',
                color: NAVY,
                border: 'none',
              }}
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          <div className="row">
            {filteredRooms.map((room) => {
              const totalForStay = nights * room.pricePerNight;
              const availableQty = room.availableQuantity ?? 5;
              const isSoldOut = availableQty <= 0;
              const isLowStock = availableQty > 0 && availableQty <= 2;
              return (
                <div className="col-md-4 mb-4" key={room._id}>
                  <div
                    className="room-card h-100 d-flex flex-column"
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 6px 24px rgba(15,23,42,0.08)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 18px 44px rgba(15,23,42,0.18)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(15,23,42,0.08)';
                    }}
                  >
                    <div className="position-relative">
                      {renderBadge(room.badge)}
                      <img
                        src={room.image}
                        alt={room.type}
                        style={{ height: '220px', width: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span
                        className="badge position-absolute top-0 end-0 m-3 px-3 py-2 fw-bold"
                        style={{
                          background: NAVY,
                          color: '#f5d76e',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                        }}
                      >
                        {formatCurrency(room.pricePerNight)}
                        <small className="ms-1" style={{ color: 'rgba(245,215,110,0.7)', fontSize: '0.7rem' }}>/night</small>
                      </span>
                      <span
                        className="badge position-absolute bottom-0 start-0 m-3 px-3 py-2"
                        style={{
                          background: 'rgba(212,175,55,0.95)',
                          color: NAVY,
                          borderRadius: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Up to {room.capacity} guests
                      </span>
                      <span
                        className="badge position-absolute bottom-0 end-0 m-3 px-3 py-2 fw-bold"
                        style={{
                          background: isSoldOut
                            ? 'linear-gradient(135deg, #475569, #1e293b)'
                            : isLowStock
                            ? GOLD_GRADIENT
                            : 'rgba(15,23,42,0.85)',
                          color: isSoldOut ? '#f87171' : isLowStock ? NAVY : '#f5d76e',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          letterSpacing: '0.3px',
                          boxShadow: isLowStock ? '0 4px 12px rgba(212,175,55,0.45)' : 'none',
                        }}
                      >
                        {isSoldOut
                          ? 'Sold Out'
                          : isLowStock
                          ? `Only ${availableQty} left!`
                          : `${availableQty} Available`}
                      </span>
                    </div>
                    <div className="card-body p-4 d-flex flex-column">
                      <h5 className="card-title fw-bold mb-2" style={{ color: NAVY }}>{room.type}</h5>
                      <p className="card-text text-muted small mb-3">
                        {room.description || 'Luxurious accommodations equipped with world-class amenities and pristine views.'}
                      </p>
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mb-3 d-flex flex-wrap gap-2">
                          {room.amenities.slice(0, 4).map((a, i) => (
                            <span
                              key={i}
                              className="badge px-3 py-2"
                              style={{
                                background: 'rgba(212,175,55,0.12)',
                                color: '#8a6d1c',
                                borderRadius: '20px',
                                fontWeight: 500,
                              }}
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                      {nights > 0 && (
                        <div
                          className="mb-3 p-2 text-center rounded"
                          style={{
                            background: 'rgba(15,23,42,0.04)',
                            border: '1px solid rgba(212,175,55,0.25)',
                          }}
                        >
                          <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                            Total for {nights} {nights === 1 ? 'night' : 'nights'}
                          </small>
                          <div className="fw-bold" style={{ color: NAVY, fontSize: '1.15rem' }}>
                            {formatCurrency(totalForStay)}
                          </div>
                        </div>
                      )}
                      <div className="d-flex gap-2 mt-auto">
                        <button
                          className="btn btn-outline-dark flex-grow-1 py-2 fw-bold rounded-pill"
                          onClick={() => openDetails(room)}
                        >
                          View Details
                        </button>
                        <button
                          className="btn flex-grow-1 py-2 fw-bold rounded-pill"
                          disabled={isSoldOut}
                          style={{
                            background: isSoldOut ? 'rgba(100,116,139,0.4)' : GOLD_GRADIENT,
                            color: isSoldOut ? '#e2e8f0' : NAVY,
                            border: 'none',
                            cursor: isSoldOut ? 'not-allowed' : 'pointer',
                            opacity: isSoldOut ? 0.7 : 1,
                          }}
                          onClick={() => openBookingDrawer(room)}
                        >
                          {isSoldOut ? 'Sold Out' : user ? 'Book Now' : 'Sign In to Book'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailsRoom && (() => {
        const images = detailsRoom.images && detailsRoom.images.length
          ? detailsRoom.images
          : [detailsRoom.image];
        const activeImage = images[detailsImageIndex] || detailsRoom.image;
        return (
          <div
            className="modal fade show"
            style={{ display: 'block', background: 'rgba(0,0,0,0.7)', zIndex: 1080 }}
            onClick={() => setDetailsRoom(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-content"
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="position-relative">
                  <img
                    src={activeImage}
                    alt={detailsRoom.type}
                    style={{ height: '340px', width: '100%', objectFit: 'cover' }}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="btn position-absolute top-50 translate-middle-y"
                        style={{ left: '12px', background: 'rgba(15,23,42,0.7)', color: '#f5d76e', borderRadius: '50%', width: '40px', height: '40px', padding: 0, border: 'none', fontSize: '1.2rem' }}
                        onClick={() => setDetailsImageIndex((p) => (p - 1 + images.length) % images.length)}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="btn position-absolute top-50 translate-middle-y"
                        style={{ right: '12px', background: 'rgba(15,23,42,0.7)', color: '#f5d76e', borderRadius: '50%', width: '40px', height: '40px', padding: 0, border: 'none', fontSize: '1.2rem' }}
                        onClick={() => setDetailsImageIndex((p) => (p + 1) % images.length)}
                      >
                        ›
                      </button>
                      <div className="position-absolute bottom-0 start-0 w-100 d-flex justify-content-center gap-1 pb-3">
                        {images.map((_, i) => (
                          <span
                            key={i}
                            style={{
                              width: i === detailsImageIndex ? '22px' : '8px',
                              height: '8px',
                              borderRadius: '4px',
                              background: i === detailsImageIndex ? GOLD : 'rgba(255,255,255,0.6)',
                              transition: 'all 0.3s ease',
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn-close position-absolute top-0 end-0 m-3"
                    style={{ background: 'rgba(255,255,255,0.9)' }}
                    onClick={() => setDetailsRoom(null)}
                  />
                  <span
                    className="badge position-absolute bottom-0 end-0 m-3 px-3 py-2 fw-bold"
                    style={{
                      background: NAVY,
                      color: '#f5d76e',
                      borderRadius: '12px',
                      fontSize: '1rem',
                    }}
                  >
                    {formatCurrency(detailsRoom.pricePerNight)} / night
                  </span>
                </div>
                <div className="modal-body p-4">
                  <h3 className="fw-bold mb-1" style={{ color: NAVY }}>{detailsRoom.type}</h3>
                  <p className="text-muted mb-3">Room #{detailsRoom.roomNumber} · Up to {detailsRoom.capacity} guests</p>
                  <p className="mb-4">{detailsRoom.description}</p>

                  {(detailsRoom.sqft || detailsRoom.viewType || detailsRoom.bedConfig) && (
                    <>
                      <h6 className="fw-bold mb-2" style={{ color: NAVY }}>Suite Specifications</h6>
                      <div className="row g-2 mb-4">
                        {detailsRoom.sqft && (
                          <div className="col-4">
                            <div className="p-3 text-center rounded" style={{ background: 'rgba(212,175,55,0.08)' }}>
                              <div style={{ color: NAVY, fontWeight: 700, fontSize: '1.3rem' }}>{detailsRoom.sqft}</div>
                              <div className="text-muted small">sq ft</div>
                            </div>
                          </div>
                        )}
                        {detailsRoom.viewType && (
                          <div className="col-4">
                            <div className="p-3 text-center rounded" style={{ background: 'rgba(212,175,55,0.08)' }}>
                              <div style={{ color: GOLD, fontSize: '1.4rem' }}>🌊</div>
                              <div className="small fw-bold" style={{ color: NAVY }}>{detailsRoom.viewType}</div>
                            </div>
                          </div>
                        )}
                        {detailsRoom.bedConfig && (
                          <div className="col-4">
                            <div className="p-3 text-center rounded" style={{ background: 'rgba(212,175,55,0.08)' }}>
                              <div style={{ color: GOLD, fontSize: '1.4rem' }}>🛏️</div>
                              <div className="small fw-bold" style={{ color: NAVY }}>{detailsRoom.bedConfig}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {detailsRoom.amenities && detailsRoom.amenities.length > 0 && (
                    <>
                      <h6 className="fw-bold mb-2" style={{ color: NAVY }}>Amenities</h6>
                      <div className="d-flex flex-wrap gap-2 mb-4">
                        {detailsRoom.amenities.map((a, i) => (
                          <span
                            key={i}
                            className="badge px-3 py-2"
                            style={{
                              background: 'rgba(212,175,55,0.12)',
                              color: '#8a6d1c',
                              borderRadius: '20px',
                              fontWeight: 500,
                            }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {detailsRoom.policies && detailsRoom.policies.length > 0 && (
                    <>
                      <h6 className="fw-bold mb-2" style={{ color: NAVY }}>Stay & Cancellation Policies</h6>
                      <ul className="mb-4 ps-3">
                        {detailsRoom.policies.map((p, i) => (
                          <li key={i} className="text-muted small mb-1" style={{ lineHeight: '1.6' }}>{p}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="d-flex gap-2">
                    <button
                      className="btn flex-grow-1 py-2 fw-bold rounded-pill"
                      style={{ background: GOLD_GRADIENT, color: NAVY, border: 'none' }}
                      onClick={() => {
                        const room = detailsRoom;
                        setDetailsRoom(null);
                        openBookingDrawer(room);
                      }}
                    >
                      {user ? 'Book This Room' : 'Sign In to Book'}
                    </button>
                    <button
                      className="btn btn-outline-dark px-4 py-2 fw-bold rounded-pill"
                      onClick={() => setDetailsRoom(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {bookingRoom && (
        <div
          onClick={() => setBookingRoom(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              height: '100%',
              width: '100%',
              maxWidth: '480px',
              background: '#fff',
              boxShadow: '-10px 0 50px rgba(0,0,0,0.3)',
              overflowY: 'auto',
              animation: 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
          >
            <div className="p-4 d-flex justify-content-between align-items-center" style={{ background: NAVY }}>
              <div>
                <div className="text-uppercase fw-bold" style={{ color: GOLD, fontSize: '0.75rem', letterSpacing: '1px' }}>
                  Confirm Your Stay
                </div>
                <h5 className="m-0 text-white">{bookingRoom.type}</h5>
              </div>
              <button
                className="btn-close btn-close-white"
                onClick={() => setBookingRoom(null)}
              />
            </div>

            <div className="p-4">
              <div className="d-flex gap-3 mb-4">
                <img
                  src={bookingRoom.image}
                  alt={bookingRoom.type}
                  style={{ width: '110px', height: '80px', objectFit: 'cover', borderRadius: '10px' }}
                />
                <div>
                  <div className="fw-bold" style={{ color: NAVY }}>{bookingRoom.type}</div>
                  <div className="text-muted small">Room #{bookingRoom.roomNumber}</div>
                  <div className="small fw-bold" style={{ color: GOLD }}>
                    {formatCurrency(bookingRoom.pricePerNight)} / night
                  </div>
                </div>
              </div>

              <div
                className="mb-4 p-3 rounded"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Check-In</span>
                  <span className="fw-bold" style={{ color: NAVY }}>{checkIn}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Check-Out</span>
                  <span className="fw-bold" style={{ color: NAVY }}>{checkOut}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Guests</span>
                  <span className="fw-bold" style={{ color: NAVY }}>{guestCount}</span>
                </div>
                <hr style={{ margin: '10px 0', borderColor: 'rgba(212,175,55,0.3)' }} />
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="text-muted">{formatCurrency(bookingRoom.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                  <span style={{ color: NAVY }}>{formatCurrency(bookingRoom.pricePerNight * nights)}</span>
                </div>
                {addonObjects.map((a) => (
                  <div key={a.id} className="d-flex justify-content-between mb-1 small">
                    <span className="text-muted">{a.icon} {a.name}{a.perNight ? ` × ${nights}` : ''}</span>
                    <span style={{ color: NAVY }}>{formatCurrency(a.perNight ? a.price * nights : a.price)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between pt-2" style={{ borderTop: '1px dashed rgba(212,175,55,0.4)' }}>
                  <span className="fw-bold" style={{ color: NAVY }}>Total</span>
                  <span className="fw-bold" style={{ color: GOLD, fontSize: '1.2rem' }}>
                    {formatCurrency(bookingRoom.pricePerNight * nights + addonsTotal)}
                  </span>
                </div>
              </div>

              <h6 className="fw-bold mb-3" style={{ color: NAVY }}>
                <span style={{ color: GOLD }}>✦</span> Enhance Your Stay
              </h6>
              <div className="d-grid gap-2 mb-4">
                {STAY_ADDONS.map((a) => {
                  const active = selectedAddons.includes(a.id);
                  const lineTotal = a.perNight ? a.price * nights : a.price;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="d-flex align-items-center gap-3 text-start p-3"
                      style={{
                        border: active ? `2px solid ${GOLD}` : '2px solid #e2e8f0',
                        background: active ? 'rgba(212,175,55,0.08)' : '#fff',
                        borderRadius: '12px',
                        color: NAVY,
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                      }}
                      onClick={() => toggleAddon(a.id)}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                      <span className="flex-grow-1">
                        <span className="fw-bold d-block">{a.name}</span>
                        <small className="text-muted">{a.desc}</small>
                      </span>
                      <span className="text-end">
                        <span className="fw-bold d-block" style={{ color: GOLD }}>{formatCurrency(a.price)}</span>
                        <small className="text-muted">{a.perNight ? `/ night` : 'one-time'}</small>
                      </span>
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: `2px solid ${active ? GOLD : '#cbd5e1'}`,
                          background: active ? GOLD : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: NAVY,
                          fontSize: '0.75rem',
                          fontWeight: 900,
                        }}
                      >
                        {active ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              <h6 className="fw-bold mb-3" style={{ color: NAVY }}>Guest Information</h6>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={guestForm.firstName}
                    onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={guestForm.lastName}
                    onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={guestForm.email}
                  onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Phone (Optional)</label>
                <input
                  type="tel"
                  className="form-control"
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Special Requests (Optional)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={guestForm.specialRequests}
                  onChange={(e) => setGuestForm({ ...guestForm, specialRequests: e.target.value })}
                  placeholder="e.g. high floor, early check-in..."
                />
              </div>

              <h6 className="fw-bold mb-3" style={{ color: NAVY }}>Payment Method</h6>
              <div className="d-grid gap-2 mb-4">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="btn d-flex align-items-center gap-3 text-start p-3"
                    style={{
                      border: paymentMethod === m.id ? `2px solid ${GOLD}` : '2px solid #e2e8f0',
                      background: paymentMethod === m.id ? 'rgba(212,175,55,0.08)' : '#fff',
                      borderRadius: '12px',
                      color: NAVY,
                    }}
                    onClick={() => setPaymentMethod(m.id)}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                    <span className="fw-bold flex-grow-1">{m.label}</span>
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: `2px solid ${paymentMethod === m.id ? GOLD : '#cbd5e1'}`,
                        background: paymentMethod === m.id ? GOLD : 'transparent',
                        boxShadow: paymentMethod === m.id ? `inset 0 0 0 3px #fff` : 'none',
                      }}
                    />
                  </button>
                ))}
              </div>

              <button
                className="btn w-100 py-3 fw-bold rounded-pill"
                style={{ background: GOLD_GRADIENT, color: NAVY, border: 'none' }}
                onClick={confirmBooking}
                disabled={submittingBooking}
              >
                {submittingBooking ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Confirming...
                  </>
                ) : (
                  `Confirm Booking · ${formatCurrency(bookingRoom.pricePerNight * nights + addonsTotal)}`
                )}
              </button>
              <p className="text-center text-muted small mt-3 mb-0">
                🔒 Your booking is secured. A confirmation will be sent to your email.
              </p>
            </div>
          </div>
        </div>
      )}

      {confirmedBooking && (() => {
        const b = confirmedBooking;
        const roomName = b.room?.type || 'Capipisa Bay Suite';
        const guest = b.guestDetails || {};
        const fullName = `${guest.firstName || ''} ${guest.lastName || ''}`.trim();
        return (
          <div
            onClick={() => setConfirmedBooking(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2200,
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
                background: '#fff',
                borderRadius: '20px',
                maxWidth: '460px',
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                border: '1px solid rgba(212,175,55,0.3)',
              }}
            >
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: GOLD_GRADIENT, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 0 30px rgba(212,175,55,0.6)' }}>✓</div>
                <h4 className="fw-bold mb-1" style={{ color: '#f5d76e' }}>Reservation Confirmed!</h4>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
                  Ref: <span className="fw-bold" style={{ color: '#f5d76e', letterSpacing: '1px' }}>#{b.bookingReference || 'CAP-XXXX'}</span>
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <div className="mb-3">
                  <small className="text-uppercase fw-bold" style={{ color: GOLD, letterSpacing: '1px' }}>Suite</small>
                  <div className="fw-bold" style={{ color: NAVY }}>{roomName}</div>
                </div>

                <div className="row mb-3">
                  <div className="col-6">
                    <small className="text-uppercase fw-bold text-muted">Check-In</small>
                    <div className="fw-bold" style={{ color: NAVY }}>{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : '—'}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-uppercase fw-bold text-muted">Check-Out</small>
                    <div className="fw-bold" style={{ color: NAVY }}>{b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : '—'}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-uppercase fw-bold text-muted">Guest</small>
                  <div className="fw-bold" style={{ color: NAVY }}>{fullName || '—'}</div>
                  <small className="text-muted">{guest.email || ''}</small>
                </div>

                {(b.addons && b.addons.length > 0) && (
                  <div className="mb-3">
                    <small className="text-uppercase fw-bold text-muted">Enhancements</small>
                    {b.addons.map((a) => (
                      <div key={a.id} className="d-flex justify-content-between" style={{ color: NAVY }}>
                        <span>{a.icon} {a.name}</span>
                        <span className="fw-bold">{formatCurrency(a.perNight ? a.price * b.nights : a.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <span className="fw-bold" style={{ color: NAVY }}>Total Amount</span>
                  <span className="fw-bold" style={{ color: GOLD, fontSize: '1.3rem' }}>{formatCurrency(b.totalAmount || 0)}</span>
                </div>

                <button
                  className="btn w-100 py-3 fw-bold rounded-pill mt-4"
                  style={{ background: GOLD_GRADIENT, color: NAVY, border: 'none' }}
                  onClick={handleDownloadVoucher}
                >
                  📥 Download E-Voucher
                </button>
                <button
                  className="btn w-100 py-2 mt-2 rounded-pill"
                  style={{ background: 'transparent', color: NAVY, border: '1px solid #e2e8f0' }}
                  onClick={() => setConfirmedBooking(null)}
                >
                  Done
                </button>
                <p className="text-center text-muted small mt-3 mb-0">
                  A confirmation has been sent to your email.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <BackToTop />
    </div>
  );
}
