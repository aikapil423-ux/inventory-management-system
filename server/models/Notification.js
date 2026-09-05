const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['demand_submitted', 'demand_approved', 'demand_rejected', 'demand_fulfilled', 'transaction_completed', 'inspection_scheduled', 'low_stock', 'general'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedEntity: { type: String, enum: ['demand', 'transaction', 'inspection', 'inventory', 'user'] },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  link: { type: String }
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
