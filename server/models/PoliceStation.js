const mongoose = require('mongoose');

const PoliceStationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  type: { type: String, enum: ['PS', 'unit'], required: true },
  inCharge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PoliceStation', PoliceStationSchema);
