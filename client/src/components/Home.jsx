import React, { useState, useEffect } from 'react';
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

const HERO_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTkv9liNysUaIUcXrZViJvpFBlkA9TlCsH7IPmW6Lhd6lxs3knZgq2gKQ&s=10',
  'https://cf.bstatic.com/xdata/images/hotel/max1024x768/290376069.jpg?k=d286ec60cc4e64cd594d45a2c45e8cd8244903f6b2b6828d36be049d592e795c&o=',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT34cwECAtkWsSA-tcgL8JlP2ZufSEui-RjFefaX4Uxda2dgx34kNc-HQw&s=10',
  'https://pix10.agoda.net/hotelImages/736975/3381239/e48e996f8d672edbc5cb5b69c8f57401.jpg?ce=3&s=414x232',
  'https://cdn.webhotelier.net/photos/w=1920/bluebayr-luxpp/L569294.jpg',
];

const AMENITIES = [
  { icon: '🏊', title: 'Infinity Ocean Pool', desc: 'A sweeping infinity pool merging with the horizon, surrounded by lush tropical gardens.' },
  { icon: '🍽️', title: 'Beachfront Fine Dining', desc: 'Savor sea-to-table cuisine crafted by award-winning chefs overlooking the bay.' },
  { icon: '💆', title: 'Luxury Spa & Wellness', desc: 'Rejuvenate with signature therapeutic massages and holistic wellness treatments.' },
  { icon: '🏖️', title: 'Private Sunset Cabanas', desc: 'Relax in exclusive beachfront cabanas as the sun sets over Manila Bay.' },
];

const TESTIMONIALS = [
  { name: 'Isabella R.', location: 'Manila, Philippines', rating: 5, quote: 'An absolute paradise. The ocean views from our suite took our breath away. Service was impeccable from start to finish.' },
  { name: 'Maria L.', location: 'Singapore', rating: 5, quote: 'The Presidential Villa exceeded every expectation. The butler service and private pool made our anniversary unforgettable.' },
  { name: 'James T.', location: 'Sydney, Australia', rating: 5, quote: 'Capipisa Bay is a hidden gem. The beachfront dining was magical and the staff treated us like royalty.' },
];

export default function Home({ onNavigateRooms }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { showToast } = useToast();

  const today = todayISO();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    API.get('/rooms')
      .then((res) => setFeaturedRooms(res.data.filter((r) => r.featured).slice(0, 3)))
      .catch(() => showToast('Failed to load featured suites.', 'error'));
  }, [showToast]);

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    socket.on('room_inventory_updated', ({ roomId, availableQuantity }) => {
      setFeaturedRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, availableQuantity } : r))
      );
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckInChange = (value) => {
    setCheckIn(value);
    if (checkOut && new Date(checkOut) <= new Date(value)) {
      setCheckOut('');
    }
  };

  const handleFindRooms = () => {
    if (!checkIn || !checkOut) {
      showToast('Please select check-in and check-out dates.', 'warning');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      showToast('Check-out date must be after check-in date.', 'warning');
      return;
    }
    navigateToRooms();
  };

  const navigateToRooms = () => {
    const params = { checkIn, checkOut, guests };
    try {
      localStorage.setItem('capipisa_booking_search', JSON.stringify(params));
    } catch (e) { /* ignore storage errors */ }
    onNavigateRooms(params);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section with Cross-Fade Carousel */}
      <div className="home-hero position-relative overflow-hidden" style={{ minHeight: '100vh' }}>
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
          className="home-hero-overlay position-absolute"
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.5) 50%, rgba(15,23,42,0.85) 100%)',
          }}
        />

        <div
          className="container position-relative h-100 d-flex flex-column justify-content-center"
          style={{ zIndex: 2, minHeight: '100vh', paddingTop: '120px', paddingBottom: '180px' }}
        >
          <div className="animate-slide-up" style={{ maxWidth: '720px' }}>
            <span
              className="badge px-4 py-2 mb-3 fw-bold text-uppercase rounded-pill"
              style={{ background: 'linear-gradient(135deg, #d4af37, #f5d76e)', color: '#1a1a1a', letterSpacing: '3px', fontSize: '0.8rem' }}
            >
              ✦ Capipisa, Tanza, Cavite ✦
            </span>
            <h1
              className="fw-bold text-white mb-4"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
            >
              Escape to <span style={{ color: '#f5d76e' }}>Coastal Elegance</span> at Capipisa Bay
            </h1>
            <p className="lead text-white mb-5" style={{ maxWidth: '600px', color: 'rgba(255,255,255,0.9)' }}>
              Experience pristine ocean views, world-class amenities, and unmatched tranquility along the historic coastline of Tanza, Cavite.
            </p>
            <button
              className="btn btn-lg px-5 py-3 fw-bold rounded-pill text-dark border-0 shadow-lg"
              onClick={navigateToRooms}
              style={{ background: 'linear-gradient(135deg, #d4af37, #f5d76e)' }}
            >
              Explore Suites & Book Now →
            </button>
          </div>
        </div>

        {/* Floating Quick Booking Bar */}
        <div className="container position-relative" style={{ zIndex: 3, marginTop: '-100px', paddingBottom: '60px' }}>
          <div
            className="booking-bar animate-slide-up"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              border: '1px solid rgba(212,175,55,0.3)',
              padding: '24px 32px',
            }}
          >
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold text-uppercase mb-1">Check-In</label>
                <div className="position-relative">
                  <span className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#d4af37', fontSize: '1.1rem', pointerEvents: 'none' }}>📅</span>
                  <input type="date" className="form-control" value={checkIn} min={today} onChange={(e) => handleCheckInChange(e.target.value)} style={{ paddingLeft: '38px' }} />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold text-uppercase mb-1">Check-Out</label>
                <div className="position-relative">
                  <span className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#d4af37', fontSize: '1.1rem', pointerEvents: 'none' }}>📅</span>
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
                <label className="form-label text-muted small fw-bold text-uppercase mb-1">Guests</label>
                <div className="position-relative">
                  <span className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#d4af37', fontSize: '1rem', pointerEvents: 'none', zIndex: 2 }}>👤</span>
                  <select className="form-select" value={guests} onChange={(e) => setGuests(e.target.value)} style={{ paddingLeft: '38px' }}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <button
                  className="btn w-100 py-3 fw-bold border-0 rounded-pill"
                  onClick={handleFindRooms}
                  style={{ background: 'linear-gradient(135deg, #d4af37, #f5d76e)', color: '#1a1a1a', boxShadow: '0 8px 24px rgba(212,175,55,0.5)', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(212,175,55,0.7)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,175,55,0.5)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  🔍 Find Available Rooms
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="text-muted fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>Our Coastal Story</span>
              <h2 className="display-6 fw-bold mt-2 mb-3" style={{ color: '#0f172a' }}>Where Modern Luxury Meets Coastal Serenity</h2>
              <p className="text-muted mb-3">
                Nestled along the scenic shores of Tanza, Capipisa Bay Resort & Hotel offers a seamless blend of contemporary architectural luxury and natural seaside relaxation.
              </p>
              <p className="text-muted">
                Whether you're planning a weekend escape or celebrating a milestone, our dedicated team ensures absolute comfort and unforgettable memories.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="p-4 rounded-4" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Resort Highlights</h5>
                <ul className="list-unstyled mb-4">
                  {['⭐ 5-Star Rated Oceanfront Suites', '🌊 Private Access to Coastal Views', '🍽️ Sea-to-Table Fine Dining', '🛡️ Secure Booking System'].map((h, i) => (
                    <li key={i} className="mb-2 text-muted">{h}</li>
                  ))}
                </ul>
                <button className="btn btn-dark w-100 py-2 fw-bold rounded-pill" onClick={navigateToRooms}>
                  View Available Rooms →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Suites Section */}
      <div className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-muted fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>Featured Collection</span>
            <h2 className="display-6 fw-bold mt-2" style={{ color: '#0f172a' }}>
              Our Most <span style={{ color: '#d4af37' }}>Exclusive</span> Suites
            </h2>
            <p className="text-muted mt-2">Handpicked accommodations for the discerning traveler.</p>
          </div>
          <div className="row g-4">
            {featuredRooms.map((room) => {
              const availableQty = room.availableQuantity ?? 5;
              const isSoldOut = availableQty <= 0;
              const isLowStock = availableQty > 0 && availableQty <= 2;
              return (
              <div className="col-md-4" key={room._id}>
                <div
                  className="card h-100 border-0 overflow-hidden"
                  style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(15,23,42,0.1)', transition: 'transform 0.4s ease, box-shadow 0.4s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(15,23,42,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(15,23,42,0.1)';
                  }}
                >
                  <div className="position-relative">
                    <img src={room.image} alt={room.type} className="w-100" style={{ height: '240px', objectFit: 'cover' }} />
                    {room.badge && (
                      <span
                        className="badge position-absolute top-0 start-0 m-3 px-3 py-2 fw-bold"
                        style={{ background: 'linear-gradient(135deg, #d4af37, #f5d76e)', color: '#1a1a1a', borderRadius: '12px' }}
                      >
                        {room.badge}
                      </span>
                    )}
                    <span
                      className="badge position-absolute top-0 end-0 m-3 px-3 py-2 fw-bold"
                      style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', color: '#f5d76e', borderRadius: '12px' }}
                    >
                      {formatCurrency(room.pricePerNight)}
                      <small className="ms-1" style={{ fontSize: '0.7rem' }}>/night</small>
                    </span>
                    <span
                      className="badge position-absolute bottom-0 end-0 m-3 px-3 py-2 fw-bold"
                      style={{
                        background: isSoldOut
                          ? 'linear-gradient(135deg, #475569, #1e293b)'
                          : isLowStock
                          ? 'linear-gradient(135deg, #d4af37, #f5d76e)'
                          : 'rgba(15,23,42,0.85)',
                        color: isSoldOut ? '#f87171' : isLowStock ? '#0f172a' : '#f5d76e',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                      }}
                    >
                      {isSoldOut ? 'Sold Out' : isLowStock ? `Only ${availableQty} left!` : `${availableQty} Available`}
                    </span>
                  </div>
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-2" style={{ color: '#0f172a' }}>{room.type}</h5>
                    <p className="text-muted small mb-3">{room.description}</p>
                    {room.amenities && room.amenities.slice(0, 4).map((a, i) => (
                      <span key={i} className="badge me-1 mb-1" style={{ background: 'rgba(212,175,55,0.12)', color: '#8a6d1c', borderRadius: '20px' }}>
                        {a}
                      </span>
                    ))}
                    <div className="mt-3">
                      <button
                        className="btn w-100 py-2 fw-bold rounded-pill border-0"
                        onClick={navigateToRooms}
                        style={{ background: 'linear-gradient(135deg, #d4af37, #f5d76e)', color: '#1a1a1a' }}
                      >
                        View Suite →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resort Experiences & Amenities Grid */}
      <div className="py-5" style={{ background: '#0f172a' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="fw-bold small text-uppercase" style={{ color: '#d4af37', letterSpacing: '2px' }}>World-Class Facilities</span>
            <h2 className="display-6 fw-bold mt-2 text-white">
              Designed for Your <span style={{ color: '#d4af37' }}>Ultimate Relaxation</span>
            </h2>
          </div>
          <div className="row g-4">
            {AMENITIES.map((a, i) => (
              <div className="col-md-3" key={i}>
                <div
                  className="p-4 h-100 text-center"
                  style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.15)', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)';
                  }}
                >
                  <div className="fs-1 mb-3">{a.icon}</div>
                  <h5 className="fw-bold text-white mb-2">{a.title}</h5>
                  <p className="text-white-50 small mb-0">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials & Location Section */}
      <div className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-7">
              <div
                className="p-5 h-100"
                style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <span className="fw-bold small text-uppercase" style={{ color: '#d4af37', letterSpacing: '2px' }}>Guest Testimonials</span>
                  <div className="d-flex gap-1">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i} style={{ color: '#f5d76e' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <p className="text-white fs-5 fst-italic mb-4" style={{ lineHeight: 1.6 }}>
                  "{TESTIMONIALS[activeTestimonial].quote}"
                </p>
                <div>
                  <h6 className="fw-bold text-white mb-0">{TESTIMONIALS[activeTestimonial].name}</h6>
                  <p className="text-white-50 small mb-3">{TESTIMONIALS[activeTestimonial].location}</p>
                </div>
                <div className="d-flex gap-2">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      className="rounded-circle border-0"
                      style={{
                        width: i === activeTestimonial ? '12px' : '8px',
                        height: i === activeTestimonial ? '12px' : '8px',
                        background: i === activeTestimonial ? '#d4af37' : 'rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onClick={() => setActiveTestimonial(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div
                className="p-5 h-100"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(15,23,42,0.03))', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <span className="fw-bold small text-uppercase" style={{ color: '#d4af37', letterSpacing: '2px' }}>Location & Sanctuary</span>
                <h3 className="fw-bold mt-2 mb-3" style={{ color: '#0f172a' }}>Capipisa Bay, Tanza, Cavite</h3>
                <p className="text-muted">
                  A serene coastal sanctuary just a short drive from Manila, where the calm waters of Manila Bay meet golden sunsets. Our resort offers the perfect escape from city life.
                </p>
                <div className="mt-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="fs-4">📍</span>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Tanza, Cavite</h6>
                      <small className="text-muted">Capipisa Bay coastline</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="fs-4">🌅</span>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Sunset Views</h6>
                      <small className="text-muted">Daily golden hour spectacles</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-4">🚗</span>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Easy Access</h6>
                      <small className="text-muted">1.5 hours from Manila</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BackToTop />
    </div>
  );
}
