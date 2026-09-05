const SignupRequest = require('../models/SignupRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

exports.getRequests = async (req, res, next) => {
  try {
    const requests = await SignupRequest.find()
      .populate('district', 'name code')
      .populate('policeStation', 'name code')
      .populate('approvedBy', 'fullName')
      .sort('-createdAt');
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) { next(err); }
};

exports.createRequest = async (req, res, next) => {
  try {
    const { fullName, username, email, phone, password, role, designation, post, badgeNumber, district, policeStation, store, address, city, state, pincode } = req.body;

    if (!fullName || !username || !email || !phone || !password || !role || !designation) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists in the system' });
    }

    const existingRequest = await SignupRequest.findOne({ username: username.toLowerCase(), status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have a pending signup request. Please wait for admin approval.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const request = await SignupRequest.create({
      fullName, username: username.toLowerCase(), email: email.toLowerCase(), phone,
      password: hashedPassword, role, designation, post, badgeNumber,
      district, policeStation, store, address, city, state, pincode,
      history: [{ action: 'created', remarks: 'Signup request submitted' }]
    });

    const admins = await User.find({ role: { $in: ['super_admin', 'district_admin'] } });
    for (const admin of admins) {
      try {
        await Notification.create({
          recipient: admin._id, sender: null,
          type: 'signup_request', title: 'New Signup Request',
          message: `New user "${fullName}" (${username}) has requested to register as ${role.replace(/_/g, ' ')}. Designation: ${designation}. Please review and approve.`,
          relatedEntity: 'signup_request', relatedEntityId: request._id, link: '/demands'
        });
      } catch (e) { /* continue */ }
    }

    res.status(201).json({
      success: true, data: request,
      message: 'Your registration request has been submitted. Please wait for admin approval. You will receive your login credentials once approved.'
    });
  } catch (err) { next(err); }
};

exports.approveRequest = async (req, res, next) => {
  try {
    const request = await SignupRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    const existingUser = await User.findOne({ $or: [{ username: request.username }, { email: request.email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: `Username or email already exists in the system. Cannot approve.` });
    }

    const newUser = await User.create({
      fullName: request.fullName,
      username: request.username,
      email: request.email,
      phone: request.phone,
      password: request.password,
      role: request.role,
      district: request.district || undefined,
      policeStation: request.policeStation || undefined,
      store: request.store || undefined,
      isActive: true
    });

    request.status = 'approved';
    request.approvedBy = req.user._id;
    request.generatedUsername = request.username;
    request.generatedPassword = '***';
    request.history.push({
      action: 'approved', by: req.user._id,
      remarks: `User account created. Username: ${request.username}`
    });
    await request.save();

    await Notification.create({
      recipient: newUser._id, sender: req.user._id,
      type: 'signup_approved', title: 'Registration Approved!',
      message: `Your registration has been approved. You can now login with username: ${request.username} and the password you set during registration.`,
      relatedEntity: 'user', relatedEntityId: newUser._id, link: '/login'
    });

    res.json({
      success: true, data: request,
      message: `Signup approved. User "${request.fullName}" can now login with username: ${request.username}`
    });
  } catch (err) { next(err); }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const request = await SignupRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'rejected';
    request.rejectionReason = req.body.rejectionReason || 'Request denied';
    request.approvedBy = req.user._id;
    request.history.push({
      action: 'rejected', by: req.user._id,
      remarks: req.body.rejectionReason || 'Request denied'
    });
    await request.save();

    res.json({ success: true, data: request, message: 'Signup request rejected.' });
  } catch (err) { next(err); }
};
