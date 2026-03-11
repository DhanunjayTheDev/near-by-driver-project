const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, index: true },
  profile_image: { type: String, default: null },
  driver_status: { type: String, enum: ['ONLINE', 'OFFLINE', 'ON_RIDE'], default: 'OFFLINE' },
  approval_status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'], default: 'PENDING' },
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  total_rides: { type: Number, default: 0 },
  vehicle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  wallet_balance: { type: Number, default: 0 },
  city_id: { type: mongoose.Schema.Types.ObjectId, ref: 'City', default: null },
  current_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  fcm_token: { type: String, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

driverSchema.index({ current_location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
