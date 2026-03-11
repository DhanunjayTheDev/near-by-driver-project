const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'user_type', required: true, index: true },
  user_type: { type: String, enum: ['User', 'Driver'], default: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['RIDE', 'PAYMENT', 'PROMO', 'SYSTEM', 'KYC'], default: 'SYSTEM' },
  is_read: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Notification', notificationSchema);
