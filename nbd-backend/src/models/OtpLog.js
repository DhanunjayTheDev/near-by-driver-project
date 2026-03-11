const mongoose = require('mongoose');

const otpLogSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  otp_code: { type: String, required: true },
  purpose: { type: String, enum: ['LOGIN', 'SIGNUP', 'RIDE_VERIFY', 'PASSWORD_RESET'], default: 'LOGIN' },
  expires_at: { type: Date, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

otpLogSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpLog', otpLogSchema);
