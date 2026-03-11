const mongoose = require('mongoose');

const RIDE_STATUSES = [
  'REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'WAITING',
  'RIDE_STARTED', 'RIDE_COMPLETED', 'PAID', 'CANCELLED',
];

const rideSchema = new mongoose.Schema({
  ride_code: { type: String, unique: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null, index: true },
  city_id: { type: mongoose.Schema.Types.ObjectId, ref: 'City', default: null },

  pickup_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String },
  },
  drop_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String },
  },

  ride_status: { type: String, enum: RIDE_STATUSES, default: 'REQUESTED' },
  ride_otp: { type: String },

  driver_arrived_time: { type: Date, default: null },
  ride_start_time: { type: Date, default: null },
  ride_end_time: { type: Date, default: null },

  estimated_distance: { type: Number, default: 0 },
  estimated_duration: { type: Number, default: 0 },

  actual_distance: { type: Number, default: 0 },
  actual_duration: { type: Number, default: 0 },

  waiting_time_minutes: { type: Number, default: 0 },
  waiting_charge: { type: Number, default: 0 },

  base_fare: { type: Number, default: 0 },
  distance_fare: { type: Number, default: 0 },
  total_fare: { type: Number, default: 0 },

  payment_status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], default: 'PENDING' },
  cancellation_reason: { type: String, default: null },
  cancelled_by: { type: String, enum: ['USER', 'DRIVER', 'SYSTEM', null], default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

rideSchema.index({ pickup_location: '2dsphere' });

module.exports = mongoose.model('Ride', rideSchema);
module.exports.RIDE_STATUSES = RIDE_STATUSES;
