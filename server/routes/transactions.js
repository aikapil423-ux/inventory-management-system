const express = require('express');
const router = express.Router();
const { getTransactions, getTransaction, createTransaction, approveTransaction, rejectTransaction } = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getTransactions).post(createTransaction);
router.route('/:id').get(getTransaction);
router.put('/:id/approve', approveTransaction);
router.put('/:id/reject', rejectTransaction);

module.exports = router;
