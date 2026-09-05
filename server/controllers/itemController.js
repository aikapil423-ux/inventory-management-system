const Item = require('../models/Item');

exports.getItems = async (req, res, next) => {
  try {
    let filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const items = await Item.find(filter).populate('category', 'name code').sort('name');
    res.json({ success: true, count: items.length, data: items });
  } catch (err) { next(err); }
};

exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('category', 'name code');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.createItem = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const item = await Item.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.getLowStockItems = async (req, res, next) => {
  try {
    const items = await Item.find({ isActive: true }).populate('category', 'name code');
    const Inventory = require('../models/Inventory');
    const Store = require('../models/Store');
    
    let storeFilter = {};
    if (req.user.role === 'mhc_storekeeper' && req.user.store) {
      storeFilter.store = req.user.store;
    } else if (req.user.role === 'tsi' || req.user.role === 'unit') {
      const stores = await Store.find({ policeStation: req.user.policeStation }).select('_id');
      storeFilter.store = { $in: stores.map(s => s._id) };
    }
    
    const inventory = await Inventory.find(storeFilter);
    const lowStock = items.filter(item => {
      const totalQty = inventory.filter(inv => inv.item.toString() === item._id.toString()).reduce((sum, inv) => sum + inv.quantity, 0);
      return totalQty <= item.reorderLevel;
    });
    
    res.json({ success: true, count: lowStock.length, data: lowStock });
  } catch (err) { next(err); }
};
