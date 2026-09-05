const District = require('../models/District');
const PoliceStation = require('../models/PoliceStation');
const Store = require('../models/Store');
const User = require('../models/User');
const Inventory = require('../models/Inventory');

exports.getDistricts = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'district_admin') {
      filter._id = req.user.district;
    }
    const districts = await District.find(filter).populate('admin', 'fullName email').sort('name');
    res.json({ success: true, count: districts.length, data: districts });
  } catch (err) { next(err); }
};

exports.getDistrict = async (req, res, next) => {
  try {
    const district = await District.findById(req.params.id).populate('admin', 'fullName email');
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    res.json({ success: true, data: district });
  } catch (err) { next(err); }
};

exports.createDistrict = async (req, res, next) => {
  try {
    const district = await District.create(req.body);
    res.status(201).json({ success: true, data: district });
  } catch (err) { next(err); }
};

exports.updateDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    res.json({ success: true, data: district });
  } catch (err) { next(err); }
};

exports.deleteDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndDelete(req.params.id);
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.getDistrictStats = async (req, res, next) => {
  try {
    const districtId = req.params.id;
    const stations = await PoliceStation.countDocuments({ district: districtId, isActive: true });
    const stores = await Store.countDocuments({ policeStation: { $in: await PoliceStation.find({ district: districtId }).select('_id') } });
    const users = await User.countDocuments({ district: districtId, isActive: true });
    const storeIds = (await Store.find({ policeStation: { $in: await PoliceStation.find({ district: districtId }).select('_id') } }).select('_id')).map(s => s._id);
    const inventoryItems = await Inventory.countDocuments({ store: { $in: storeIds } });
    
    res.json({
      success: true,
      data: { stations, stores, users, inventoryItems }
    });
  } catch (err) { next(err); }
};
