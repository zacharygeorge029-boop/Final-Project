import React from 'react';

export default function Home({ onNavigateRooms }) {
  return (
    <div className="animate-fade-in">
      {/* Hero Landing Section */}
      <div className="hero-landing">
        <div className="hero-landing-content animate-slide-up">
          <span className="badge bg-warning text-dark mb-3 px-3 py-2 fw-bold text-uppercase rounded-pill">Capipisa, Tanza, Cavite</span>
          
          <h1>Escape to Coastal Elegance at Capipisa Bay</h1>
          
          <p>Experience pristine ocean views, world-class amenities, and unmatched tranquility along the historic coastline.</p>
          
          {/* This is the updated, styled button */}
          <button 
            className="btn btn-warning px-5 py-3 fw-bold rounded-pill text-dark shadow-lg border-0 text-uppercase"
            onClick={onNavigateRooms}
            style={{ 
              fontSize: '1.1rem',
              transition: 'all 0.3s ease-in-out'
            }}
          >
            Explore Suites & Book Now →
          </button>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="story-section">
        <div className="story-container">
          <div>
            <span className="text-muted fw-bold small text-uppercase tracking-wider">Our Coastal Story</span>
            <h2 className="display-6 fw-bold mt-2 text-dark" style={{ maxWidth: '600px' }}>
              Where Modern Luxury Meets Coastal Serenity
            </h2>
            <p className="text-muted mt-3" style={{ maxWidth: '550px' }}>
              Nestled along the scenic shores of Tanza, Capipisa Bay Resort & Hotel offers a seamless blend of contemporary architectural luxury and natural seaside relaxation. Whether you are planning a weekend escape or celebrating a milestone, our dedicated team ensures absolute comfort.
            </p>
          </div>
          <div className="bg-light p-4 rounded-4 shadow-sm" style={{ minWidth: '300px' }}>
            <h5 className="fw-bold mb-3">Resort Highlights</h5>
            <ul className="list-unstyled text-muted small mb-4">
              <li className="mb-2">⭐ 5-Star Rated Oceanfront Suites</li>
              <li className="mb-2">🌊 Private Access to Coastal Views</li>
              <li className="mb-2">🍽️ Sea-to-Table Fine Dining</li>
              <li>🛡️ Secure JWT Authentication & Booking</li>
            </ul>
            <button className="btn btn-dark w-100 py-2 fw-bold rounded-pill" onClick={onNavigateRooms}>
              View Available Rooms →
            </button>
          </div>
        </div>
      </div>

      {/* Amenities Section */}
      <div className="amenities-section">
        <div className="container">
          <span className="text-muted fw-bold small text-uppercase">World-Class Facilities</span>
          <h2 className="fw-bold mb-5 text-dark">Designed for Your Ultimate Relaxation</h2>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="amenity-card">
                <div className="fs-1 mb-3">🏊‍♂️</div>
                <h5 className="fw-bold">Infinity Bay Pool</h5>
                <p className="text-muted small">Immerse yourself in our temperature-controlled pool overlooking the horizon.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="amenity-card">
                <div className="fs-1 mb-3">🌿</div>
                <h5 className="fw-bold">Holistic Wellness Spa</h5>
                <p className="text-muted small">Rejuvenate your body and mind with signature therapeutic coastal massages.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="amenity-card">
                <div className="fs-1 mb-3">🍷</div>
                <h5 className="fw-bold">Sunset Lounge & Bar</h5>
                <p className="text-muted small">Sip artisan cocktails while taking in breathtaking sunsets over Manila Bay.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}