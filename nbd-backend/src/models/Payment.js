const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  payment_method: { type: String, enum: ['CASH', 'UPI', 'CARD', 'WALLET'], required: true },
  payment_gateway: { type: String, default: null },
  transaction_id: { type: String, default: null },
  payment_status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], default: 'PENDING' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Payment', paymentSchema);
