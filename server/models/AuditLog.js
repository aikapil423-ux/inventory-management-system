const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'view'], required: true },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  oldValues: { type: mongoose.Schema.Types.Mixed },
  newValues: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
