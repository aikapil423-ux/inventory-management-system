const User = require('../models/User');
const District = require('../models/District');
const PoliceStation = require('../models/PoliceStation');
const Store = require('../models/Store');

exports.dataIsolation = async (req, res, next) => {
  const user = req.user;

  if (['super_admin', 'inspection_officer'].includes(user.role)) {
    return next();
  }

  if (user.role === 'district_admin') {
    req.queryFilter = { district: user.district };
    return next();
  }

  if (user.role === 'tsi' || user.role === 'unit') {
    req.queryFilter = { policeStation: user.policeStation };
    return next();
  }

  if (user.role === 'mhc_storekeeper') {
    req.queryFilter = { store: user.store };
    return next();
  }

  next();
};

exports.canManageUsers = async (req, res, next) => {
  const user = req.user;

  if (user.role === 'super_admin') {
    return next();
  }

  if (user.role === 'district_admin') {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Only admins can manage users' });
};

exports.canManageDistrict = async (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Only Super Admin can manage districts' });
};

exports.ensureDistrictScope = async (req, res, next) => {
  const user = req.user;

  if (user.role === 'super_admin') {
    return next();
  }

  if (user.role === 'district_admin') {
    if (req.body.district && req.body.district.toString() !== user.district.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot create resources outside your district' });
    }
    if (!req.body.district) {
      req.body.district = user.district;
    }
    return next();
  }

  if (user.district) {
    req.body.district = user.district;
  }
  if (user.policeStation) {
    req.body.policeStation = user.policeStation;
  }
  if (user.store) {
    req.body.store = user.store;
  }

  next();
};
