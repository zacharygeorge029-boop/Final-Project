const Reservation = require('../models/Reservation');

exports.getReservations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { user: req.user.id };
    }
    const reservations = await Reservation.find(query).populate('room').populate('user', 'name email');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, totalAmount } = req.body;

    const overlapping = await Reservation.findOne({
      room,
      status: 'confirmed',
      $or: [
        { checkInDate: { $lte: checkOutDate }, checkOutDate: { $gte: checkInDate } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Room is already booked for these dates' });
    }

    const newReservation = new Reservation({
      user: req.user.id,
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

    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    reservation.status = 'cancelled';
    await reservation.save();
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};