const mongoose = require('mongoose');

const pricingConfigSchema = new mongoose.Schema({
  ride_type: { type: String, enum: ['AUTO', 'MINI', 'SEDAN', 'SUV', 'BIKE'], required: true, unique: true },
  base_fare: { type: Number, required: true },
  per_km_charge: { type: Number, required: true },
  per_minute_charge: { type: Number, required: true },
  free_waiting_minutes: { type: Number, default: 3 },
  waiting_charge_per_minute: { type: Number, default: 2 },
  commission_percentage: { type: Number, default: 20 },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PricingConfig', pricingConfigSchema);
