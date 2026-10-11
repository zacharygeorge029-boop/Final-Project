const mongoose = require('mongoose');

const nameRegex = /^[a-zA-Z\s'-]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const countryCodeRegex = /^\+\d{1,4}$/;
const phoneRegex = /^\d{7,15}$/;

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    match: [nameRegex, 'First name can only contain letters, spaces, hyphens, and apostrophes'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    match: [nameRegex, 'Last name can only contain letters, spaces, hyphens, and apostrophes'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [emailRegex, 'Please provide a valid email address'],
  },
  phone: {
    countryCode: {
      type: String,
      required: [true, 'Country code is required'],
      match: [countryCodeRegex, 'Country code must start with + followed by 1-4 digits'],
    },
    number: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [phoneRegex, 'Phone number must be 7-15 digits'],
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: { values: ['guest', 'admin'], message: 'Role must be either guest or admin' },
    default: 'guest',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
