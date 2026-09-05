const Inspection = require('../models/Inspection');

const generateInspectionNumber = async () => {
  const count = await Inspection.countDocuments();
  return `INS-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
};

exports.getInspections = async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.store) filter.store = req.query.store;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.overallStatus = req.query.status;
    if (req.user.role === 'mhc_storekeeper' && req.user.store) {
      filter.store = req.user.store;
    }
    const inspections = await Inspection.find(filter).populate('inspector', 'fullName role').populate('store', 'name code').populate('items.item', 'name code').sort('-inspectedAt');
    res.json({ success: true, count: inspections.length, data: inspections });
  } catch (err) { next(err); }
};

exports.getInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id).populate('inspector', 'fullName role').populate('store', 'name code').populate('items.item', 'name code unit');
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });
    res.json({ success: true, data: inspection });
  } catch (err) { next(err); }
};

exports.createInspection = async (req, res, next) => {
  try {
    req.body.inspectionNumber = await generateInspectionNumber();
    req.body.inspector = req.user._id;
    if (req.body.items) {
      req.body.items.forEach(item => {
        item.discrepancy = item.expectedQuantity - item.inspectedQuantity;
      });
    }
    const inspection = await Inspection.create(req.body);
    res.status(201).json({ success: true, data: inspection });
  } catch (err) { next(err); }
};

exports.updateInspection = async (req, res, next) => {
  try {
    if (req.body.items) {
      req.body.items.forEach(item => {
        item.discrepancy = item.expectedQuantity - item.inspectedQuantity;
      });
    }
    const inspection = await Inspection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });
    res.json({ success: true, data: inspection });
  } catch (err) { next(err); }
};
