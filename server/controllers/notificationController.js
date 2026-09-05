const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const filter = { recipient: req.user._id };
    if (req.query.unreadOnly === 'true') filter.isRead = false;
    const notifications = await Notification.find(filter).populate('sender', 'fullName role').sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (err) { next(err); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.createNotification = async (recipientId, senderId, type, title, message, relatedEntity, relatedEntityId, link) => {
  try {
    await Notification.create({
      recipient: recipientId, sender: senderId, type, title, message,
      relatedEntity, relatedEntityId, link
    });
  } catch (err) { console.error('Notification error:', err); }
};
