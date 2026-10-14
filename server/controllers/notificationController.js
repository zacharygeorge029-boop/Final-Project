const Notification = require('../Model/Notification');
const User = require('../Model/User');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.userId,
    });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.userId });
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNotification = async ({ recipient, title, message, type, relatedId = null }) => {
  try {
    const notification = new Notification({
      recipient,
      title,
      message,
      type,
      relatedId,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

exports.notifyAdmins = async ({ title, message, type, relatedId = null }) => {
  try {
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      title,
      message,
      type,
      relatedId,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    return notifications;
  } catch (err) {
    console.error('Failed to notify admins:', err.message);
    return [];
  }
};
