const Store = require('../models/Store');
const Inventory = require('../models/Inventory');

exports.getStores = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'mhc_storekeeper' && req.user.store) {
      filter._id = req.user.store;
    } else if (req.user.role === 'tsi' || req.user.role === 'unit') {
      filter.policeStation = req.user.policeStation;
    } else if (req.user.role === 'district_admin') {
      filter.policeStation = { $in: (await require('../models/PoliceStation').find({ district: req.user.district }).select('_id')).map(ps => ps._id) };
    } else if (req.query.policeStation) {
      filter.policeStation = req.query.policeStation;
    }
    const stores = await Store.find(filter).populate('policeStation', 'name code').populate('storeKeeper', 'fullName').sort('name');
    res.json({ success: true, count: stores.length, data: stores });
  } catch (err) { next(err); }
};

exports.getStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id).populate('policeStation', 'name code').populate('storeKeeper', 'fullName');
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, data: store });
  } catch (err) { next(err); }
};

exports.createStore = async (req, res, next) => {
  try {
    const store = await Store.create(req.body);
    res.status(201).json({ success: true, data: store });
  } catch (err) { next(err); }
};

exports.updateStore = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, data: store });
  } catch (err) { next(err); }
};

exports.deleteStore = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.getStoreInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find({ store: req.params.id }).populate('item', 'name code unit category').sort('-updatedAt');
    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (err) { next(err); }
};

exports.getStoreStats = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    const inventory = await Inventory.find({ store: storeId });
    const totalItems = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const lowStock = inventory.filter(inv => inv.quantity <= (inv.item?.reorderLevel || 0)).length;
    const conditions = { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 };
    inventory.forEach(inv => { if (conditions[inv.condition] !== undefined) conditions[inv.condition]++; });
    
    res.json({ success: true, data: { totalItems, totalRecords: inventory.length, lowStock, conditions } });
  } catch (err) { next(err); }
};
