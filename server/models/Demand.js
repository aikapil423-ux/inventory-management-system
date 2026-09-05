const mongoose = require('mongoose');

const DemandSchema = new mongoose.Schema({
  demandNumber: { type: String, required: true, unique: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sentTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 },
    urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    reason: { type: String }
  }],
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected'], default: 'draft' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  remarks: { type: String },
  history: [{
    action: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
    remarks: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Demand', DemandSchema);
