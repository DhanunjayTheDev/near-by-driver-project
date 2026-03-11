const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: null, maxlength: 500 },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Rating', ratingSchema);
