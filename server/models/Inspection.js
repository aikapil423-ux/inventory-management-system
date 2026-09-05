const mongoose = require('mongoose');

const InspectionSchema = new mongoose.Schema({
  inspectionNumber: { type: String, required: true, unique: true },
  inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  type: { type: String, enum: ['routine', 'special', 'annual'], required: true },
  findings: { type: String },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    inspectedQuantity: { type: Number },
    expectedQuantity: { type: Number },
    discrepancy: { type: Number },
    condition: { type: String, enum: ['new', 'good', 'fair', 'poor', 'damaged'] },
    remarks: { type: String }
  }],
  overallStatus: { type: String, enum: ['satisfactory', 'needs_attention', 'critical'] },
  recommendations: { type: String },
  reportUrl: { type: String },
  inspectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Inspection', InspectionSchema);
