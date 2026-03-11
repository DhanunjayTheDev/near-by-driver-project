const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true, index: true },
  action: { type: String, required: true },
  target_id: { type: mongoose.Schema.Types.ObjectId, default: null },
  details: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
