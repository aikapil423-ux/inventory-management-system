const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: function() { return !this.googleId; }, minlength: 6 },
  googleId: { type: String, sparse: true },
  fullName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['super_admin', 'district_admin', 'tsi', 'mhc_storekeeper', 'inspection_officer', 'unit'], required: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  policeStation: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  phone: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

module.exports = mongoose.model('User', UserSchema);
