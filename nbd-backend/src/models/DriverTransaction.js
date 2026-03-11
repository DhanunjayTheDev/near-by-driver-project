const mongoose = require('mongoose');

const driverTransactionSchema = new mongoose.Schema({
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null },
  amount: { type: Number, required: true },
  commission: { type: Number, default: 0 },
  type: { type: String, enum: ['CREDIT', 'DEBIT', 'COMMISSION', 'WITHDRAWAL', 'BONUS'], required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('DriverTransaction', driverTransactionSchema);
