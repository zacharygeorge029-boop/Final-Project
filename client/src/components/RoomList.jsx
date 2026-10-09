import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    API.get('/rooms')
      .then((res) => setRooms(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleBookRoom = async (roomId, pricePerNight) => {
    if (!checkIn || !checkOut) {
      alert('Please select your check-in and check-out dates first!');
      return;
    }

    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      alert('Check-out date must be after check-in date.');
      return;
    }
    const totalAmount = days * pricePerNight;

    try {
      await API.post('/reservations', {
        room: roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalAmount
      });
      setMessage('Room successfully reserved!');
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Banner Section with Background Image */}
      <div className="main-hero-bg">
        <div className="animate-slide-up">
          <h1 className="hero-title">Experience Ultimate Luxury</h1>
          <p className="hero-subtitle">Immerse yourself in elegance, exceptional service, and breathtaking suites tailored for your ultimate getaway.</p>
        </div>
      </div>

      {/* Reservation & Rooms Section */}
      <div className="container my-5">
        <div className="bg-white p-4 rounded-4 shadow-sm mb-5">
          <h5 className="mb-3 fw-bold text-dark">Plan Your Stay Dates</h5>
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label text-muted small fw-bold">CHECK-IN</label>
              <input type="date" className="form-control" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="col-md-5">
              <label className="form-label text-muted small fw-bold">CHECK-OUT</label>
              <input type="date" className="form-control" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-dark w-100 py-2 fw-bold" onClick={() => alert('Dates set! Choose your preferred room below.')}>Apply</button>
            </div>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}

        <h3 className="mb-4 fw-bold text-dark">Available Rooms & Suites</h3>
        <div className="row pb-5">
          {rooms.map((room) => (
            <div className="col-md-4 mb-4" key={room._id}>
              <div className="room-card h-100 d-flex flex-column">
                <div style={{ height: '220px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-muted fw-bold">Room {room.roomNumber} Suite</span>
                </div>
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title fw-bold m-0">{room.type}</h5>
                    <span className="text-dark fw-bold fs-5">${room.pricePerNight} <small className="text-muted fs-6">/ night</small></span>
                  </div>
                  <p className="card-text text-muted small mb-4">{room.description || 'Luxurious accommodations equipped with world-class amenities and pristine views.'}</p>
                  <button 
                    className="btn btn-outline-dark mt-auto py-2 fw-bold" 
                    onClick={() => handleBookRoom(room._id, room.pricePerNight)}
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}