const Reservation = require('../Model/Reservation');

exports.getReservations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { user: req.user.userId };
    }
    const reservations = await Reservation.find(query).populate('room').populate('user', 'firstName lastName email');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, totalAmount } = req.body;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: 'Invalid check-in or check-out date' });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const overlapping = await Reservation.findOne({
      room,
      status: 'Confirmed',
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Room is already booked for these dates' });
    }

    const newReservation = new Reservation({
      user: req.user.userId,
      room,
      checkInDate,
      checkOutDate,
      totalAmount
    });

    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    if (reservation.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    reservation.status = 'Cancelled';
    await reservation.save();
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};