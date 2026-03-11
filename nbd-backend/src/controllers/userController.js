const User = require('../models/User');
const SupportTicket = require('../models/SupportTicket');
const { getUserNotifications, markAsRead, markAllAsRead } = require('../services/notificationService');

// ── Profile ──

exports.getProfile = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'default_payment_method'];
    const updates = {};
    allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    if (req.file) updates.profile_image = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateFCMToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fcm_token });
    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Notifications ──

exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await getUserNotifications(req.user._id, page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id, req.user._id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await markAllAsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Support Tickets ──

exports.createSupportTicket = async (req, res) => {
  try {
    const { ride_id, issue_type, description } = req.body;
    if (!issue_type || !description) return res.status(400).json({ success: false, message: 'Issue type and description are required' });

    const ticket = await SupportTicket.create({ user_id: req.user._id, ride_id, issue_type, description });
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user_id: req.user._id }).sort({ created_at: -1 }).lean();
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
