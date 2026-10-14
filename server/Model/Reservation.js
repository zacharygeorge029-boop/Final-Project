const mongoose = require('mongoose');

const AddonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  perNight: { type: Boolean, default: false },
});

const GuestDetailsSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  specialRequests: { type: String, default: '' },
});

const RefundDetailsSchema = new mongoose.Schema({
  requestedAt: { type: Date, default: null },
  processedAt: { type: Date, default: null },
  amount: { type: Number, default: 0 },
  reason: { type: String, default: '' },
});

const ReservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  addons: { type: [AddonSchema], default: [] },
  addonsTotal: { type: Number, default: 0 },
  roomTotal: { type: Number, default: 0 },
  guestDetails: { type: GuestDetailsSchema, default: null },
  paymentMethod: { type: String, enum: ['card', 'ewallet', 'cash'], required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refund_requested', 'refunded'],
    default: 'pending',
  },
  refundDetails: { type: RefundDetailsSchema, default: () => ({}) },
  bookingReference: { type: String, unique: true },
  status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
