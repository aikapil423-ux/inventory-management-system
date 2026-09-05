const PoliceStation = require('../models/PoliceStation');
const Store = require('../models/Store');
const Inventory = require('../models/Inventory');

exports.getPoliceStations = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'district_admin') {
      filter.district = req.user.district;
    } else if (req.user.role === 'tsi' || req.user.role === 'unit') {
      filter._id = req.user.policeStation;
    } else if (req.query.district) {
      filter.district = req.query.district;
    }
    const stations = await PoliceStation.find(filter).populate('district', 'name code').populate('inCharge', 'fullName').sort('name');
    res.json({ success: true, count: stations.length, data: stations });
  } catch (err) { next(err); }
};

exports.getPoliceStation = async (req, res, next) => {
  try {
    const station = await PoliceStation.findById(req.params.id).populate('district', 'name code').populate('inCharge', 'fullName');
    if (!station) return res.status(404).json({ success: false, message: 'Police Station not found' });
    res.json({ success: true, data: station });
  } catch (err) { next(err); }
};

exports.createPoliceStation = async (req, res, next) => {
  try {
    if (req.user.role === 'district_admin' && !req.body.district) {
      req.body.district = req.user.district;
    }
    const station = await PoliceStation.create(req.body);
    res.status(201).json({ success: true, data: station });
  } catch (err) { next(err); }
};

exports.updatePoliceStation = async (req, res, next) => {
  try {
    const station = await PoliceStation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!station) return res.status(404).json({ success: false, message: 'Police Station not found' });
    res.json({ success: true, data: station });
  } catch (err) { next(err); }
};

exports.deletePoliceStation = async (req, res, next) => {
  try {
    const station = await PoliceStation.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ success: false, message: 'Police Station not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
