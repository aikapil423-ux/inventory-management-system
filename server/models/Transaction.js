const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['receive', 'issue', 'return', 'transfer', 'damage', 'disposal', 'adjustment'], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  fromStore: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  toStore: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  quantity: { type: Number, required: true, min: 1 },
  condition: { type: String, enum: ['new', 'good', 'fair', 'poor', 'damaged'], default: 'new' },
  referenceNumber: { type: String, trim: true },
  issuedTo: {
    name: { type: String },
    designation: { type: String },
    badgeNumber: { type: String }
  },
  reason: { type: String, trim: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  documents: [{ type: String }],
  remarks: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
