const express = require('express');
const router = express.Router();
const { getStockSummary, getStockHealth, getDemandRanking, getCategoryBreakdown, getAuditTrail, getForecast } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stock-summary', getStockSummary);
router.get('/stock-health', getStockHealth);
router.get('/demand-ranking', getDemandRanking);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/audit-trail', getAuditTrail);
router.get('/forecast', getForecast);

module.exports = router;
