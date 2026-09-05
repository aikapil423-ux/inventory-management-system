const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser, toggleUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { canManageUsers } = require('../middleware/dataIsolation');

router.use(protect);
router.route('/').get(getUsers).post(canManageUsers, createUser);
router.route('/:id').get(getUser).put(canManageUsers, updateUser).delete(canManageUsers, deleteUser);
router.put('/:id/status', canManageUsers, toggleUserStatus);

module.exports = router;
