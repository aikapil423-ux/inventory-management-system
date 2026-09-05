const express = require('express');
const router = express.Router();
const { getInspections, getInspection, createInspection, updateInspection } = require('../controllers/inspectionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getInspections).post(authorize('inspection_officer', 'super_admin', 'district_admin'), createInspection);
router.route('/:id').get(getInspection).put(updateInspection);

module.exports = router;
