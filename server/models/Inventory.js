const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  condition: { type: String, enum: ['new', 'good', 'fair', 'poor', 'damaged'], default: 'new' },
  batchNumber: { type: String, trim: true },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date },
  location: { type: String, trim: true },
  lastUpdated: { type: Date }
}, { timestamps: true });

InventorySchema.index({ store: 1, item: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', InventorySchema);
