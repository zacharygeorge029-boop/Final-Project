const User = require('../Model/User');
const bcrypt = require('bcrypt');

const nameRegex = /^[a-zA-Z\s'-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const countryCodeRegex = /^\+\d{1,4}$/;
const phoneRegex = /^\d{10,11}$/;

const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.com.ph',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'capipisabay.com',
  'capipisabay.ph',
  'capipisabayresort.com',
];
const allowedDomainSuffixes = ['.edu', '.edu.ph'];

const isAllowedEmailDomain = (domain) => {
  const lower = domain.toLowerCase();
  if (ALLOWED_EMAIL_DOMAINS.includes(lower)) return true;
  return allowedDomainSuffixes.some((suffix) => lower.endsWith(suffix));
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, countryCode, phone, avatar, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (firstName !== undefined) {
      const trimmed = firstName.trim();
      if (trimmed.length < 2 || trimmed.length > 50 || !nameRegex.test(trimmed)) {
        return res.status(400).json({ message: 'First name must be 2-50 characters, letters only.' });
      }
      user.firstName = trimmed;
    }

    if (lastName !== undefined) {
      const trimmed = lastName.trim();
      if (trimmed.length < 2 || trimmed.length > 50 || !nameRegex.test(trimmed)) {
        return res.status(400).json({ message: 'Last name must be 2-50 characters, letters only.' });
      }
      user.lastName = trimmed;
    }

    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
      }
      const emailDomain = trimmedEmail.split('@')[1];
      if (!isAllowedEmailDomain(emailDomain)) {
        return res.status(400).json({
          message: 'Please enter a valid email address (e.g., Gmail, Yahoo, Outlook, or official @capipisabay.com address)',
        });
      }
      const existing = await User.findOne({ email: trimmedEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }
      user.email = trimmedEmail;
    }

    if (countryCode !== undefined || phone !== undefined) {
      const newCountry = countryCode !== undefined ? countryCode : user.phone.countryCode;
      const newNumber = phone !== undefined ? phone : user.phone.number;
      if (!countryCodeRegex.test(newCountry)) {
        return res.status(400).json({ message: 'Invalid country code (e.g., +63, +1, +44).' });
      }
      if (!phoneRegex.test(newNumber)) {
        return res.status(400).json({ message: 'Please provide a valid 10-digit or 11-digit phone number.' });
      }
      user.phone = { countryCode: newCountry, number: newNumber };
    }

    if (avatar !== undefined) {
      user.avatar = avatar.trim();
    }

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new password are required to change your password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
};
