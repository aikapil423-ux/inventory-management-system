const express = require('express');
const router = express.Router();
const { getInventories, getInventory, createInventory, updateInventory, getInventoryByStore } = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getInventories).post(createInventory);
router.route('/:id').get(getInventory).put(updateInventory);
router.get('/store/:storeId', getInventoryByStore);

module.exports = router;
