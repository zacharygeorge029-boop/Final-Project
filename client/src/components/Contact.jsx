import React, { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="main-hero-bg">
      <div className="luxury-card animate-slide-up">
        <h2 className="mb-2 fw-bold text-dark text-center">Contact Us</h2>
        <p className="text-muted text-center small mb-4">We are here to assist with your inquiries and luxury reservations.</p>
        
        {submitted ? (
          <div className="alert alert-success text-center">Thank you! Your message has been sent.</div>
        ) : (
          <form onSubmit={handleSubmit} className="text-start">
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">YOUR NAME</label>
              <input type="text" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
              <input type="email" className="form-control" required />
            </div>
            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">MESSAGE</label>
              <textarea className="form-control" rows="3" required></textarea>
            </div>
            <button type="submit" className="btn btn-dark w-100 py-3 fw-bold shadow-sm">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}