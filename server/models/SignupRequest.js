const mongoose = require('mongoose');

const SignupRequestSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true, lowercase: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['tsi', 'mhc_storekeeper', 'inspection_officer', 'unit'], required: true },
  designation: { type: String, required: true, trim: true },
  post: { type: String, trim: true },
  badgeNumber: { type: String, trim: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  policeStation: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generatedUsername: { type: String },
  generatedPassword: { type: String },
  rejectionReason: { type: String },
  history: [{
    action: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
    remarks: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('SignupRequest', SignupRequestSchema);
