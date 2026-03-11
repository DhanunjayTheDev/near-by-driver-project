const mongoose = require('mongoose');

const rideStatusLogSchema = new mongoose.Schema({
  ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
  status: { type: String, required: true },
  updated_by: { type: String, enum: ['USER', 'DRIVER', 'SYSTEM'], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RideStatusLog', rideStatusLogSchema);
