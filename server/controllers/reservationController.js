const Reservation = require('../Model/Reservation');
const Room = require('../Model/Room');
const { createNotification, notifyAdmins } = require('./notificationController');

const normalizePaymentMethod = (method) => {
  if (method === 'arrival' || method === 'cash') return 'cash';
  if (method === 'gcash' || method === 'ewallet') return 'ewallet';
  if (method === 'card') return 'card';
  return 'cash';
};

const isOnlinePayment = (method) => method === 'card' || method === 'ewallet';

const generateBookingReference = () => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CAP-${year}-${code}`;
};

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
    const {
      room,
      checkInDate,
      checkOutDate,
      totalAmount,
      addons = [],
      addonsTotal = 0,
      roomTotal = 0,
      guestDetails,
      paymentMethod = 'arrival',
    } = req.body;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: 'Invalid check-in or check-out date' });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const activeBooking = await Reservation.findOne({
      user: req.user.userId,
      status: { $ne: 'Cancelled' },
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have an active reservation. Please cancel your current booking before making a new one.",
      });
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

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if ((roomDoc.availableQuantity ?? 0) <= 0) {
      return res.status(400).json({ message: 'Sorry, this room is currently sold out.' });
    }

    const bookingReference = generateBookingReference();
    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

    const newReservation = new Reservation({
      user: req.user.userId,
      room,
      checkInDate,
      checkOutDate,
      totalAmount,
      addons,
      addonsTotal,
      roomTotal,
      guestDetails,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: isOnlinePayment(normalizedPaymentMethod) ? 'paid' : 'pending',
      bookingReference,
    });

    await newReservation.save();
    await newReservation.populate('room');

    const updatedRoom = await Room.findByIdAndUpdate(
      room,
      { $inc: { availableQuantity: -1 } },
      { new: true }
    );
    const io = req.app.get('io');
    if (io) {
      io.emit('room_inventory_updated', {
        roomId: room,
        availableQuantity: updatedRoom ? updatedRoom.availableQuantity : 0,
      });
    }

    const guestName = guestDetails
      ? `${guestDetails.firstName} ${guestDetails.lastName}`.trim()
      : 'A guest';

    notifyAdmins({
      title: 'New Booking Request',
      message: `${guestName} made a new reservation (Ref: ${bookingReference}).`,
      type: 'new_booking',
      relatedId: newReservation._id,
    });

    createNotification({
      recipient: req.user.userId,
      title: 'Reservation Confirmed',
      message: `Your reservation (Ref: ${bookingReference}) has been confirmed.`,
      type: 'booking_update',
      relatedId: newReservation._id,
    });

    res.status(201).json(newReservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const wasConfirmed = reservation.status === 'Confirmed';

    reservation.paymentMethod = normalizePaymentMethod(reservation.paymentMethod);
    if (!reservation.paymentStatus) {
      reservation.paymentStatus = 'pending';
    }

    const onlinePaid = isOnlinePayment(reservation.paymentMethod);

    reservation.status = 'Cancelled';

    if (onlinePaid && wasConfirmed) {
      reservation.paymentStatus = 'refund_requested';
      reservation.refundDetails = {
        requestedAt: new Date(),
        amount: reservation.totalAmount,
        reason: 'Guest cancelled reservation',
      };
    }

    await reservation.save();

    if (wasConfirmed && reservation.room && !onlinePaid) {
      const updatedRoom = await Room.findByIdAndUpdate(
        reservation.room,
        { $inc: { availableQuantity: 1 } },
        { new: true }
      );
      const io = req.app.get('io');
      if (io) {
        io.emit('room_inventory_updated', {
          roomId: reservation.room.toString(),
          availableQuantity: updatedRoom ? updatedRoom.availableQuantity : 0,
        });
      }
    }

    const message = onlinePaid
      ? 'Reservation cancelled. A refund request has been submitted and will be processed shortly.'
      : 'Reservation cancelled successfully.';

    res.status(200).json({ success: true, message, reservation, refundRequested: onlinePaid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.paymentStatus !== 'refund_requested') {
      return res.status(400).json({ success: false, message: 'No refund request pending for this reservation.' });
    }

    reservation.paymentMethod = normalizePaymentMethod(reservation.paymentMethod);
    reservation.paymentStatus = 'refunded';
    reservation.refundDetails.processedAt = new Date();
    await reservation.save();

    if (reservation.room) {
      const updatedRoom = await Room.findByIdAndUpdate(
        reservation.room,
        { $inc: { availableQuantity: 1 } },
        { new: true }
      );
      const io = req.app.get('io');
      if (io) {
        io.emit('room_inventory_updated', {
          roomId: reservation.room.toString(),
          availableQuantity: updatedRoom ? updatedRoom.availableQuantity : 0,
        });
      }
    }

    createNotification({
      recipient: reservation.user.toString(),
      title: 'Refund Processed',
      message: `Your refund for reservation (Ref: ${reservation.bookingReference}) has been processed. $${Number(reservation.totalAmount).toLocaleString()} will be returned to your payment method.`,
      type: 'booking_update',
      relatedId: reservation._id,
    });

    res.status(200).json({ success: true, message: 'Refund processed successfully.', reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
