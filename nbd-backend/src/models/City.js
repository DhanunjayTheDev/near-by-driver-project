const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  city_name: { type: String, required: true, unique: true, trim: true },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('City', citySchema);
