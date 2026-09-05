const Demand = require('../models/Demand');
const User = require('../models/User');
const Notification = require('../models/Notification');

const generateDemandNumber = async () => {
  const count = await Demand.countDocuments();
  return `DMN-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
};

const findApprover = async (demand) => {
  const store = await require('../models/Store').findById(demand.store).populate('policeStation');
  if (!store) return null;
  const ps = store.policeStation;
  if (!ps) return null;
  const tsi = await User.findOne({ policeStation: ps._id, role: 'tsi' });
  if (tsi) return tsi;
  const districtAdmin = await User.findOne({ district: ps.district, role: 'district_admin' });
  return districtAdmin;
};

const notify = async (recipientId, senderId, type, title, message, relatedEntity, relatedEntityId, link) => {
  try {
    await Notification.create({
      recipient: recipientId, sender: senderId, type, title, message,
      relatedEntity, relatedEntityId, link
    });
  } catch (err) { console.error('Notification error:', err); }
};

exports.getDemands = async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'mhc_storekeeper' && req.user.store) {
      filter.store = req.user.store;
    } else if (req.user.role === 'tsi' || req.user.role === 'unit') {
      const Store = require('../models/Store');
      const stores = (await Store.find({ policeStation: req.user.policeStation }).select('_id')).map(s => s._id);
      filter.$or = [{ store: { $in: stores } }, { sentTo: req.user._id }];
    } else if (req.user.role === 'district_admin') {
      const PoliceStation = require('../models/PoliceStation');
      const Store = require('../models/Store');
      const stations = (await PoliceStation.find({ district: req.user.district }).select('_id')).map(ps => ps._id);
      const stores = (await Store.find({ policeStation: { $in: stations } }).select('_id')).map(s => s._id);
      filter.$or = [{ store: { $in: stores } }, { sentTo: req.user._id }];
    }
    const demands = await Demand.find(filter)
      .populate('requestedBy', 'fullName role')
      .populate('sentTo', 'fullName role')
      .populate('store', 'name code')
      .populate('items.item', 'name code unit')
      .populate('approvedBy', 'fullName')
      .sort('-createdAt');
    res.json({ success: true, count: demands.length, data: demands });
  } catch (err) { next(err); }
};

exports.getDemand = async (req, res, next) => {
  try {
    const demand = await Demand.findById(req.params.id)
      .populate('requestedBy', 'fullName role')
      .populate('sentTo', 'fullName role')
      .populate('store', 'name code')
      .populate('items.item', 'name code unit')
      .populate('approvedBy', 'fullName')
      .populate('history.by', 'fullName role');
    if (!demand) return res.status(404).json({ success: false, message: 'Demand not found' });
    res.json({ success: true, data: demand });
  } catch (err) { next(err); }
};

exports.createDemand = async (req, res, next) => {
  try {
    req.body.demandNumber = await generateDemandNumber();
    req.body.requestedBy = req.user._id;
    if (!req.body.store && req.user.store) req.body.store = req.user.store;
    if (req.user.district) req.body.district = req.user.district;
    const demand = await Demand.create(req.body);
    res.status(201).json({ success: true, data: demand });
  } catch (err) { next(err); }
};

exports.updateDemand = async (req, res, next) => {
  try {
    const demand = await Demand.findById(req.params.id);
    if (!demand) return res.status(404).json({ success: false, message: 'Demand not found' });
    if (demand.status !== 'draft' && demand.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Cannot update demand in current status' });
    }
    Object.assign(demand, req.body);
    await demand.save();
    res.json({ success: true, data: demand });
  } catch (err) { next(err); }
};

exports.submitDemand = async (req, res, next) => {
  try {
    const demand = await Demand.findById(req.params.id);
    if (!demand) return res.status(404).json({ success: false, message: 'Demand not found' });

    const approver = await findApprover(demand);
    demand.status = 'submitted';
    demand.sentTo = approver ? approver._id : null;
    demand.history.push({
      action: 'submitted',
      by: req.user._id,
      remarks: req.body.remarks || 'Demand submitted for approval'
    });
    await demand.save();

    if (approver) {
      await notify(
        approver._id, req.user._id, 'demand_submitted',
        'New Demand Submitted',
        `${req.user.fullName} has submitted demand ${demand.demandNumber} for ${demand.store?.name || 'store'}. Please review and approve/reject.`,
        'demand', demand._id, '/demands'
      );
    }

    const store = await require('../models/Store').findById(demand.store);
    const storePS = store ? await require('../models/PoliceStation').findById(store.policeStation) : null;
    const districtName = storePS ? (await require('../models/District').findById(storePS.district))?.name : '';

    res.json({ success: true, data: demand, message: approver ? `Demand sent to ${approver.fullName} (${approver.role === 'tsi' ? 'TSI' : 'District Admin'}) for approval` : 'Demand submitted' });
  } catch (err) { next(err); }
};

exports.approveDemand = async (req, res, next) => {
  try {
    const demand = await Demand.findById(req.params.id);
    if (!demand) return res.status(404).json({ success: false, message: 'Demand not found' });
    if (demand.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Demand is not in submitted status' });
    }
    demand.status = 'approved';
    demand.approvedBy = req.user._id;
    demand.approvedAt = new Date();
    demand.history.push({
      action: 'approved',
      by: req.user._id,
      at: new Date(),
      remarks: req.body.remarks || 'Demand approved'
    });
    await demand.save();

    await notify(
      demand.requestedBy, req.user._id, 'demand_approved',
      'Demand Approved!',
      `Your demand ${demand.demandNumber} has been approved by ${req.user.fullName}. You can now collect the items from the store.`,
      'demand', demand._id, '/demands'
    );

    res.json({ success: true, data: demand, message: 'Demand approved. Notification sent to requester.' });
  } catch (err) { next(err); }
};

exports.rejectDemand = async (req, res, next) => {
  try {
    const demand = await Demand.findById(req.params.id);
    if (!demand) return res.status(404).json({ success: false, message: 'Demand not found' });
    if (demand.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Demand is not in submitted status' });
    }
    if (!req.body.rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    demand.status = 'rejected';
    demand.approvedBy = req.user._id;
    demand.rejectionReason = req.body.rejectionReason;
    demand.history.push({
      action: 'rejected',
      by: req.user._id,
      at: new Date(),
      remarks: req.body.rejectionReason
    });
    await demand.save();

    await notify(
      demand.requestedBy, req.user._id, 'demand_rejected',
      'Demand Rejected',
      `Your demand ${demand.demandNumber} has been rejected by ${req.user.fullName}. Reason: ${req.body.rejectionReason}. Please review and resubmit if needed.`,
      'demand', demand._id, '/demands'
    );

    res.json({ success: true, data: demand, message: 'Demand rejected. Notification sent to requester.' });
  } catch (err) { next(err); }
};

exports.fulfillDemand = async (req, res, next) => {
  try {
    const demand = await Demand.findById(req.params.id);
    if (!demand) return res.status(404).json({ success: false, message: 'Demand not found' });
    demand.status = req.body.partial ? 'partially_fulfilled' : 'fulfilled';
    demand.history.push({
      action: req.body.partial ? 'partially_fulfilled' : 'fulfilled',
      by: req.user._id,
      at: new Date(),
      remarks: req.body.remarks || 'Demand fulfilled'
    });
    await demand.save();

    await notify(
      demand.requestedBy, req.user._id, 'demand_fulfilled',
      'Demand Fulfilled',
      `Your demand ${demand.demandNumber} has been fulfilled. Please collect your items from the store.`,
      'demand', demand._id, '/demands'
    );

    res.json({ success: true, data: demand });
  } catch (err) { next(err); }
};
