const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  vehicle_type: { type: String, enum: ['AUTO', 'MINI', 'SEDAN', 'SUV', 'BIKE'], required: true },
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  vehicle_number: { type: String, required: true, unique: true, uppercase: true },
  vehicle_color: { type: String, trim: true },
  vehicle_year: { type: Number },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Vehicle', vehicleSchema);
