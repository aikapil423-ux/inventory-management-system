const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const Demand = require('../models/Demand');
const Item = require('../models/Item');
const Category = require('../models/Category');
const Store = require('../models/Store');
const AuditLog = require('../models/AuditLog');

exports.getStockSummary = async (req, res, next) => {
  try {
    let storeFilter = {};
    if (req.user.role === 'mhc_storekeeper' && req.user.store) {
      storeFilter.store = req.user.store;
    } else if (req.user.role === 'tsi' || req.user.role === 'unit') {
      const stores = (await Store.find({ policeStation: req.user.policeStation }).select('_id')).map(s => s._id);
      storeFilter.store = { $in: stores };
    }
    
    const inventory = await Inventory.find(storeFilter).populate('item', 'name code unit category').populate('store', 'name code');
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const lowStockCount = inventory.filter(inv => inv.quantity <= (inv.item?.reorderLevel || 0)).length;
    const outOfStock = inventory.filter(inv => inv.quantity === 0).length;
    
    res.json({ success: true, data: { totalItems, totalQuantity, lowStockCount, outOfStock, inventory } });
  } catch (err) { next(err); }
};

exports.getStockHealth = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true });
    const categoryStats = await Promise.all(categories.map(async (cat) => {
      const items = await Item.find({ category: cat._id });
      const itemIds = items.map(i => i._id);
      const inventory = await Inventory.find({ item: { $in: itemIds } });
      const totalQty = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      return { category: cat.name, code: cat.code, totalItems: items.length, totalQuantity: totalQty };
    }));
    res.json({ success: true, data: categoryStats });
  } catch (err) { next(err); }
};

exports.getDemandRanking = async (req, res, next) => {
  try {
    const items = await Item.find();
    const demands = await Demand.find({ status: { $in: ['submitted', 'approved', 'fulfilled'] } }).populate('items.item', 'name code');
    const itemDemandMap = {};
    demands.forEach(d => {
      d.items.forEach(di => {
        const itemId = di.item?._id?.toString();
        if (itemId) {
          if (!itemDemandMap[itemId]) itemDemandMap[itemId] = { name: di.item.name, code: di.item.code, totalDemand: 0, demandCount: 0 };
          itemDemandMap[itemId].totalDemand += di.quantity;
          itemDemandMap[itemId].demandCount++;
        }
      });
    });
    const ranking = Object.values(itemDemandMap).sort((a, b) => b.totalDemand - a.totalDemand);
    res.json({ success: true, data: ranking });
  } catch (err) { next(err); }
};

exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true });
    const breakdown = await Promise.all(categories.map(async (cat) => {
      const items = await Item.find({ category: cat._id });
      const itemIds = items.map(i => i._id);
      const inventory = await Inventory.find({ item: { $in: itemIds } });
      const totalQty = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      const totalValue = inventory.reduce((sum, inv) => sum + (inv.quantity * (inv.item?.unitPrice || 0)), 0);
      const conditions = { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 };
      inventory.forEach(inv => { if (conditions[inv.condition] !== undefined) conditions[inv.condition] += inv.quantity; });
      return { category: cat.name, code: cat.code, totalItems: items.length, totalQuantity: totalQty, totalValue, conditions };
    }));
    res.json({ success: true, data: breakdown });
  } catch (err) { next(err); }
};

exports.getAuditTrail = async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.user) filter.user = req.query.user;
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.startDate) filter.createdAt = { $gte: new Date(req.query.startDate) };
    if (req.query.endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(req.query.endDate) };
    
    const logs = await AuditLog.find(filter).populate('user', 'fullName role').sort('-createdAt').limit(500);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) { next(err); }
};

exports.getForecast = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const transactions = await Transaction.find({ type: 'issue', createdAt: { $gte: thirtyDaysAgo } }).populate('item', 'name code');
    const itemUsage = {};
    transactions.forEach(t => {
      const itemId = t.item?._id?.toString();
      if (itemId) {
        if (!itemUsage[itemId]) itemUsage[itemId] = { name: t.item.name, code: t.item.code, totalIssued: 0, days: 30 };
        itemUsage[itemId].totalIssued += t.quantity;
      }
    });
    const forecast = Object.values(itemUsage).map(item => ({
      ...item,
      avgDailyUsage: (item.totalIssued / 30).toFixed(2),
      projectedMonthly: Math.ceil(item.totalIssued)
    })).sort((a, b) => b.totalIssued - a.totalIssued);
    
    res.json({ success: true, data: forecast });
  } catch (err) { next(err); }
};
