const mongoose = require('mongoose');

const driverWalletSchema = new mongoose.Schema({
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, unique: true, index: true },
  wallet_balance: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DriverWallet', driverWalletSchema);
