const Notification = require('../models/Notification');

// TODO: Integrate firebase-admin SDK for push notifications
// const admin = require('firebase-admin');

const sendPushNotification = async (fcmToken, title, message) => {
  if (!fcmToken) return;
  try {
    // TODO: Uncomment when Firebase is configured
    // await admin.messaging().send({
    //   token: fcmToken,
    //   notification: { title, body: message },
    // });
    console.log(`[FCM] Sent to ${fcmToken}: ${title}`);
  } catch (error) {
    console.error('[FCM] Error sending notification:', error.message);
  }
};

const createNotification = async ({ user_id, user_type = 'User', title, message, type = 'SYSTEM' }) => {
  const notification = await Notification.create({ user_id, user_type, title, message, type });
  return notification;
};

const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const notifications = await Notification.find({ user_id: userId })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const total = await Notification.countDocuments({ user_id: userId });
  return { notifications, total, page, pages: Math.ceil(total / limit) };
};

const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user_id: userId },
    { is_read: true },
    { new: true }
  );
};

const markAllAsRead = async (userId) => {
  return Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true });
};

module.exports = { sendPushNotification, createNotification, getUserNotifications, markAsRead, markAllAsRead };
