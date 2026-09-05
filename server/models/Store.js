const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  policeStation: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation', required: true },
  storeKeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: String, trim: true },
  capacity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Store', StoreSchema);
