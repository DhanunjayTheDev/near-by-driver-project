const mongoose = require('mongoose');

const driverKYCSchema = new mongoose.Schema({
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  aadhaar_number: { type: String, required: true },
  aadhaar_front_image: { type: String, required: true },
  aadhaar_back_image: { type: String, required: true },
  driving_license_number: { type: String, required: true },
  driving_license_image: { type: String, required: true },
  rc_number: { type: String, required: true },
  rc_image: { type: String, required: true },
  selfie_with_vehicle: { type: String, required: true },
  verification_status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
  verified_by_admin: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  verified_at: { type: Date, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('DriverKYC', driverKYCSchema);
