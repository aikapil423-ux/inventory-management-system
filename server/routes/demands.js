const express = require('express');
const router = express.Router();
const { getDemands, getDemand, createDemand, updateDemand, submitDemand, approveDemand, rejectDemand, fulfillDemand } = require('../controllers/demandController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getDemands).post(createDemand);
router.route('/:id').get(getDemand).put(updateDemand);
router.put('/:id/submit', submitDemand);
router.put('/:id/approve', approveDemand);
router.put('/:id/reject', rejectDemand);
router.put('/:id/fulfill', fulfillDemand);

module.exports = router;
