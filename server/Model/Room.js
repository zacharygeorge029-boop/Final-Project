const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
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
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);