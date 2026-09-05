const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, trim: true },
  unit: { type: String, enum: ['piece', 'pair', 'set', 'kg', 'liter', 'box'], required: true },
  minimumStock: { type: Number, default: 0 },
  maximumStock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  condition: { type: String, enum: ['new', 'good', 'fair', 'poor', 'damaged'], default: 'new' },
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
