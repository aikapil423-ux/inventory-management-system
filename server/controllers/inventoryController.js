const Inventory = require('../models/Inventory');

exports.getInventories = async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.store) filter.store = req.query.store;
    if (req.query.item) filter.item = req.query.item;
    if (req.query.condition) filter.condition = req.query.condition;
    
    if (req.user.role === 'mhc_storekeeper' && req.user.store) {
      filter.store = req.user.store;
    } else if ((req.user.role === 'tsi' || req.user.role === 'unit') && req.user.policeStation) {
      const Store = require('../models/Store');
      const stores = await Store.find({ policeStation: req.user.policeStation }).select('_id');
      filter.store = { $in: stores.map(s => s._id) };
    }
    
    const inventories = await Inventory.find(filter).populate('item', 'name code unit category').populate('store', 'name code').sort('-updatedAt');
    res.json({ success: true, count: inventories.length, data: inventories });
  } catch (err) { next(err); }
};

exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('item', 'name code unit category').populate('store', 'name code');
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory record not found' });
    res.json({ success: true, data: inventory });
  } catch (err) { next(err); }
};

exports.createInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: inventory });
  } catch (err) { next(err); }
};

exports.updateInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, { ...req.body, lastUpdated: new Date() }, { new: true, runValidators: true });
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory record not found' });
    res.json({ success: true, data: inventory });
  } catch (err) { next(err); }
};

exports.getInventoryByStore = async (req, res, next) => {
  try {
    const inventories = await Inventory.find({ store: req.params.storeId }).populate('item', 'name code unit category').sort('-updatedAt');
    res.json({ success: true, count: inventories.length, data: inventories });
  } catch (err) { next(err); }
};
