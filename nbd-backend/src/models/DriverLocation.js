const mongoose = require('mongoose');

const driverLocationSchema = new mongoose.Schema({
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, unique: true, index: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  heading: { type: Number, default: 0 },
  speed: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now },
});

driverLocationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('DriverLocation', driverLocationSchema);
