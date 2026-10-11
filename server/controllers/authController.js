const User = require('../Model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const nameRegex = /^[a-zA-Z\s'-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const countryCodeRegex = /^\+\d{1,4}$/;
const phoneRegex = /^\d{7,15}$/;

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

    if (!countryCodeRegex.test(countryCode)) {
      return res.status(400).json({ message: 'Invalid country code (e.g., +63, +1, +44)' });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone number must contain 7-15 digits only' });
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: GENERIC_AUTH_ERROR });
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
