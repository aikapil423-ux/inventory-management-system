const mongoose = require('mongoose');

const PasswordResetRequestSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, lowercase: true },
  mobile: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  newPassword: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
  smsSent: { type: Boolean, default: false },
  whatsappSent: { type: Boolean, default: false },
  history: [{
    action: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
    remarks: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('PasswordResetRequest', PasswordResetRequestSchema);
