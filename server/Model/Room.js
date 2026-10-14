const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  title: { type: String },
  category: { type: String, default: 'Suite' },
  pricePerNight: { type: Number, required: true },
  description: { type: String },
  capacity: { type: Number, required: true },
  amenities: [{ type: String }],
  image: { type: String },
  images: [{ type: String }],
  featured: { type: Boolean, default: false },
  badge: { type: String },
  sqft: { type: Number },
  viewType: { type: String },
  bedConfig: { type: String },
  policies: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  available: { type: Boolean, default: true },
  availableQuantity: { type: Number, default: 5, min: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);