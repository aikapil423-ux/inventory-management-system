const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');

const generateTransactionNumber = async (type) => {
  const prefix = { receive: 'RCV', issue: 'ISS', return: 'RET', transfer: 'TRF', damage: 'DMG', disposal: 'DSP', adjustment: 'ADJ' };
  const count = await Transaction.countDocuments({ type });
  return `${prefix[type]}-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
};

exports.getTransactions = async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.store) {
      filter.$or = [{ fromStore: req.query.store }, { toStore: req.query.store }];
    }
    if (req.user.role === 'mhc_storekeeper' && req.user.store) {
      filter.$or = [{ fromStore: req.user.store }, { toStore: req.user.store }];
    } else if (req.user.role === 'tsi' || req.user.role === 'unit') {
      const Store = require('../models/Store');
      const stores = (await Store.find({ policeStation: req.user.policeStation }).select('_id')).map(s => s._id);
      filter.$or = [{ fromStore: { $in: stores } }, { toStore: { $in: stores } }];
    }
    const transactions = await Transaction.find(filter).populate('item', 'name code unit').populate('fromStore', 'name code').populate('toStore', 'name code').populate('createdBy', 'fullName').populate('approvedBy', 'fullName').sort('-createdAt');
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (err) { next(err); }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('item', 'name code unit').populate('fromStore', 'name code').populate('toStore', 'name code').populate('createdBy', 'fullName').populate('approvedBy', 'fullName');
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: transaction });
  } catch (err) { next(err); }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { type } = req.body;
    req.body.transactionNumber = await generateTransactionNumber(type);
    req.body.createdBy = req.user._id;
    if (!req.body.fromStore && (req.user.role === 'mhc_storekeeper')) {
      req.body.fromStore = req.user.store;
    }
    const transaction = await Transaction.create(req.body);
    
    if (type === 'receive' && req.body.toStore) {
      let inv = await Inventory.findOne({ store: req.body.toStore, item: req.body.item });
      if (inv) {
        inv.quantity += req.body.quantity;
        inv.condition = req.body.condition || inv.condition;
        inv.lastUpdated = new Date();
        await inv.save();
      } else {
        inv = await Inventory.create({ store: req.body.toStore, item: req.body.item, quantity: req.body.quantity, condition: req.body.condition || 'new', lastUpdated: new Date() });
      }
      transaction.status = 'completed';
      await transaction.save();
    }
    
    if (type === 'issue' && req.body.fromStore) {
      let inv = await Inventory.findOne({ store: req.body.fromStore, item: req.body.item });
      if (!inv || inv.quantity < req.body.quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
      inv.quantity -= req.body.quantity;
      inv.lastUpdated = new Date();
      await inv.save();
      transaction.status = 'completed';
      await transaction.save();
    }
    
    if (type === 'return' && req.body.toStore) {
      let inv = await Inventory.findOne({ store: req.body.toStore, item: req.body.item });
      if (inv) {
        inv.quantity += req.body.quantity;
        inv.lastUpdated = new Date();
        await inv.save();
      }
      transaction.status = 'completed';
      await transaction.save();
    }

    res.status(201).json({ success: true, data: transaction });
  } catch (err) { next(err); }
};

exports.approveTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    transaction.status = 'approved';
    transaction.approvedBy = req.user._id;
    await transaction.save();
    res.json({ success: true, data: transaction });
  } catch (err) { next(err); }
};

exports.rejectTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    transaction.status = 'rejected';
    transaction.approvedBy = req.user._id;
    transaction.remarks = req.body.remarks || transaction.remarks;
    await transaction.save();
    res.json({ success: true, data: transaction });
  } catch (err) { next(err); }
};
