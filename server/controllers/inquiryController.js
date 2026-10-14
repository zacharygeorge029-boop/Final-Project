const Inquiry = require('../Model/Inquiry');
const { createNotification, notifyAdmins } = require('./notificationController');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

exports.createInquiry = async (req, res) => {
  try {
    const { name, email, message, userId } = req.body;

    if (!name || !email || !message || !userId) {
      return res.status(400).json({ success: false, error: 'Name, email, message, and user ID are required.' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      return res.status(400).json({ success: false, error: 'Name must be between 2 and 80 characters.' });
    }

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    const emailDomain = trimmedEmail.split('@')[1];
    if (!isAllowedEmailDomain(emailDomain)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address (e.g., Gmail, Yahoo, Outlook, or official @capipisabay.com address)',
      });
    }

    if (trimmedMessage.length < 10 || trimmedMessage.length > 2000) {
      return res.status(400).json({ success: false, error: 'Message must be between 10 and 2000 characters.' });
    }

    const inquiry = new Inquiry({
      user: userId,
      name: trimmedName,
      email: trimmedEmail.toLowerCase(),
      message: trimmedMessage,
    });

    await inquiry.save();

    notifyAdmins({
      title: 'New Inquiry Received',
      message: `Guest ${trimmedName} sent a new message.`,
      type: 'new_inquiry',
      relatedId: inquiry._id,
    });

    res.status(201).json({ success: true, message: 'Inquiry saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInquiriesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const inquiries = await Inquiry.find({ user: userId }).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    if (inquiry.status === 'unread') {
      inquiry.status = 'read';
      await inquiry.save();
    }

    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.replyToInquiry = async (req, res) => {
  try {
    const { replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({ message: 'Reply message is required.' });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    inquiry.replyMessage = replyMessage.trim();
    inquiry.status = 'replied';
    inquiry.repliedAt = new Date();

    await inquiry.save();

    createNotification({
      recipient: inquiry.user,
      title: 'Concierge Response',
      message: 'The concierge team responded to your inquiry.',
      type: 'inquiry_reply',
      relatedId: inquiry._id,
    });

    res.json({
      message: 'Reply sent successfully.',
      inquiry,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }
    res.json({ message: 'Inquiry deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
