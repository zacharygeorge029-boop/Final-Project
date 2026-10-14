const User = require('../Model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

const GENERIC_AUTH_ERROR = 'Invalid email or password';

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, countryCode, phone } = req.body;

    if (!firstName || !lastName || !email || !password || !countryCode || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (firstName.length < 2 || firstName.length > 50 ||
        lastName.length < 2 || lastName.length > 50) {
      return res.status(400).json({ message: 'First and last name must be between 2 and 50 characters' });
    }

    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      return res.status(400).json({
        message: 'Names can only contain letters, spaces, hyphens, and apostrophes (no numbers allowed)'
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const emailDomain = email.trim().split('@')[1];
    if (!isAllowedEmailDomain(emailDomain)) {
      return res.status(400).json({
        message: 'Please enter a valid email address (e.g., Gmail, Yahoo, Outlook, or official @capipisabay.com address)'
      });
    }

    if (!countryCodeRegex.test(countryCode)) {
      return res.status(400).json({ message: 'Invalid country code (e.g., +63, +1, +44)' });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit or 11-digit phone number.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: { countryCode, number: phone },
      password: hashedPassword,
      role: 'guest',
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const loginDomain = email.trim().split('@')[1];
    if (!isAllowedEmailDomain(loginDomain)) {
      return res.status(400).json({
        message: 'Please enter a valid email address (e.g., Gmail, Yahoo, Outlook, or official @capipisabay.com address)'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: GENERIC_AUTH_ERROR });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'This account has been suspended. Please contact the resort administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: GENERIC_AUTH_ERROR });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
