const express = require('express');
const router = express.Router();
const PoliceStation = require('../models/PoliceStation');
const { getPoliceStations, getPoliceStation, createPoliceStation, updatePoliceStation, deletePoliceStation } = require('../controllers/policeStationController');
const { protect, authorize } = require('../middleware/auth');
const { ensureDistrictScope } = require('../middleware/dataIsolation');

router.get('/public', async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.district) filter.district = req.query.district;
    const stations = await PoliceStation.find(filter).select('name code district').sort('name');
    res.json({ success: true, count: stations.length, data: stations });
  } catch (err) { next(err); }
});

router.use(protect);
router.route('/').get(getPoliceStations).post(ensureDistrictScope, createPoliceStation);
router.route('/:id').get(getPoliceStation).put(updatePoliceStation).delete(deletePoliceStation);

module.exports = router;
