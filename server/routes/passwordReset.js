const express = require('express');
const router = express.Router();
const { getRequests, createRequest, approveRequest, rejectRequest } = require('../controllers/passwordResetController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', createRequest);
router.get('/', protect, authorize('super_admin', 'district_admin'), getRequests);
router.put('/:id/approve', protect, authorize('super_admin', 'district_admin'), approveRequest);
router.put('/:id/reject', protect, authorize('super_admin', 'district_admin'), rejectRequest);

module.exports = router;
