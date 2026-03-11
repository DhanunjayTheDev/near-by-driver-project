const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null },
  issue_type: { type: String, enum: ['PAYMENT', 'DRIVER', 'RIDE', 'APP', 'OTHER'], required: true },
  description: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
