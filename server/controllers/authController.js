const User = require('../models/User');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true };
  if (process.env.NODE_ENV === 'production') options.secure = true;
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      district: user.district,
      policeStation: user.policeStation,
      store: user.store,
      phone: user.phone
    }
  });
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, fullName, role, district, policeStation, store, phone } = req.body;
    const user = await User.create({ username, email, password, fullName, role, district, policeStation, store, phone });
    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('district', 'name code').populate('policeStation', 'name code').populate('store', 'name code');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) { next(err); }
};
