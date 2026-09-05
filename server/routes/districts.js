const express = require('express');
const router = express.Router();
const District = require('../models/District');
const { getDistricts, getDistrict, createDistrict, updateDistrict, deleteDistrict, getDistrictStats } = require('../controllers/districtController');
const { protect, authorize } = require('../middleware/auth');
const { canManageDistrict } = require('../middleware/dataIsolation');

router.get('/public', async (req, res, next) => {
  try {
    const districts = await District.find({ isActive: true }).select('name code').sort('name');
    res.json({ success: true, count: districts.length, data: districts });
  } catch (err) { next(err); }
});

router.route('/').get(protect, getDistricts).post(protect, canManageDistrict, createDistrict);
router.route('/:id').get(protect, getDistrict).put(protect, canManageDistrict, updateDistrict).delete(protect, canManageDistrict, deleteDistrict);
router.get('/:id/stats', protect, getDistrictStats);

module.exports = router;
