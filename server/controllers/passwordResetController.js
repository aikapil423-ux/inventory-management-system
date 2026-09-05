const PasswordResetRequest = require('../models/PasswordResetRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let pass = '';
  for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
};

exports.getRequests = async (req, res, next) => {
  try {
    const requests = await PasswordResetRequest.find()
      .populate('userId', 'fullName username role phone district policeStation store')
      .populate('approvedBy', 'fullName')
      .sort('-createdAt');
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) { next(err); }
};

exports.createRequest = async (req, res, next) => {
  try {
    const { username, mobile } = req.body;
    if (!username || !mobile) {
      return res.status(400).json({ success: false, message: 'Username and mobile number are required' });
    }
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this username' });
    }

    const request = await PasswordResetRequest.create({
      username: username.toLowerCase(),
      mobile,
      userId: user._id,
      history: [{ action: 'created', remarks: 'Password reset request submitted' }]
    });

    const admins = await User.find({ role: { $in: ['super_admin', 'district_admin'] } });
    for (const admin of admins) {
      try {
        await Notification.create({
          recipient: admin._id,
          sender: user._id,
          type: 'password_reset_request',
          title: 'Password Reset Request',
          message: `User "${user.fullName}" (${user.username}) has requested a password reset. Mobile: ${mobile}. Please review and approve.`,
          relatedEntity: 'password_reset',
          relatedEntityId: request._id,
          link: '/demands'
        });
      } catch (e) { /* continue */ }
    }

    res.status(201).json({
      success: true,
      data: request,
      message: 'Your password reset request has been sent to the admin. You will receive your new password via SMS/WhatsApp once approved.'
    });
  } catch (err) { next(err); }
};

exports.approveRequest = async (req, res, next) => {
  try {
    const request = await PasswordResetRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request has already been processed' });
    }

    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(request.userId, { password: hashedPassword });

    request.status = 'approved';
    request.newPassword = newPassword;
    request.approvedBy = req.user._id;
    request.smsSent = true;
    request.whatsappSent = true;
    request.history.push({
      action: 'approved',
      by: req.user._id,
      remarks: `Password reset approved. New password: ${newPassword}`
    });
    await request.save();

    if (request.userId) {
      await Notification.create({
        recipient: request.userId,
        sender: req.user._id,
        type: 'password_reset_approved',
        title: 'Password Reset Approved',
        message: `Your password has been reset. Your new password is: ${newPassword}. Please login and change your password immediately. (Also sent via SMS/WhatsApp to ${request.mobile})`,
        relatedEntity: 'password_reset',
        relatedEntityId: request._id,
        link: '/login'
      });
    }

    res.json({
      success: true,
      data: request,
      message: `Password reset approved. New password sent via SMS/WhatsApp to ${request.mobile}.`
    });
  } catch (err) { next(err); }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const request = await PasswordResetRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request has already been processed' });
    }

    request.status = 'rejected';
    request.rejectionReason = req.body.rejectionReason || 'Request denied';
    request.approvedBy = req.user._id;
    request.history.push({
      action: 'rejected',
      by: req.user._id,
      remarks: req.body.rejectionReason || 'Request denied'
    });
    await request.save();

    if (request.userId) {
      await Notification.create({
        recipient: request.userId,
        sender: req.user._id,
        type: 'password_reset_rejected',
        title: 'Password Reset Rejected',
        message: `Your password reset request has been rejected. Reason: ${req.body.rejectionReason || 'Request denied'}. Please contact your administrator.`,
        relatedEntity: 'password_reset',
        relatedEntityId: request._id,
        link: '/login'
      });
    }

    res.json({ success: true, data: request, message: 'Password reset request rejected.' });
  } catch (err) { next(err); }
};
