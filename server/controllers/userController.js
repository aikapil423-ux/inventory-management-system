const User = require('../models/User');

exports.getUsers = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'district_admin') {
      filter.district = req.user.district;
    } else if (req.query.district) {
      filter.district = req.query.district;
    }
    if (req.query.role) filter.role = req.query.role;
    if (req.query.policeStation) filter.policeStation = req.query.policeStation;
    if (req.query.store) filter.store = req.query.store;

    const users = await User.find(filter).populate('district', 'name code').populate('policeStation', 'name code').populate('store', 'name code').sort('-createdAt');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('district', 'name code').populate('policeStation', 'name code').populate('store', 'name code');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    if (req.user.role === 'district_admin') {
      if (!req.body.district) req.body.district = req.user.district;
      if (req.body.district.toString() !== req.user.district.toString()) {
        return res.status(403).json({ success: false, message: 'Cannot create users outside your district' });
      }
    }
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (req.user.role === 'district_admin') {
      const target = await User.findById(req.params.id);
      if (!target) return res.status(404).json({ success: false, message: 'User not found' });
      if (target.district.toString() !== req.user.district.toString()) {
        return res.status(403).json({ success: false, message: 'Cannot update users outside your district' });
      }
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user.role === 'district_admin') {
      const target = await User.findById(req.params.id);
      if (!target) return res.status(404).json({ success: false, message: 'User not found' });
      if (target.district.toString() !== req.user.district.toString()) {
        return res.status(403).json({ success: false, message: 'Cannot delete users outside your district' });
      }
      if (target.role === 'super_admin' || target.role === 'district_admin') {
        return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
      }
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (req.user.role === 'district_admin' && user.district.toString() !== req.user.district.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot modify users outside your district' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};
