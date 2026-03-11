const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  phone: { type: String, required: true, unique: true, index: true },
  email: { type: String, trim: true, lowercase: true },
  profile_image: { type: String, default: null },
  status: { type: String, enum: ['ACTIVE', 'BLOCKED', 'DELETED'], default: 'ACTIVE' },
  default_payment_method: { type: String, enum: ['CASH', 'UPI', 'CARD', 'WALLET'], default: 'CASH' },
  fcm_token: { type: String, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', userSchema);
