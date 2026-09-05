const express = require('express');
const router = express.Router();
const { getStores, getStore, createStore, updateStore, deleteStore, getStoreInventory, getStoreStats } = require('../controllers/storeController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getStores).post(createStore);
router.route('/:id').get(getStore).put(updateStore).delete(deleteStore);
router.get('/:id/inventory', getStoreInventory);
router.get('/:id/stats', getStoreStats);

module.exports = router;
