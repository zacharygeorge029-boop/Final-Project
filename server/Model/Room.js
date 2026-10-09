const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // e.g., Deluxe, Suite, Standard
  pricePerNight: { type: Number, required: true },
  capacity: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);