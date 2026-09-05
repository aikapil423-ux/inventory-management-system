const AuditLog = require('../models/AuditLog');

exports.logAction = (action, entity) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        AuditLog.create({
          user: req.user._id,
          action,
          entity,
          entityId: req.params.id || (data && data.data && data.data._id),
          oldValues: req.body._oldValues || undefined,
          newValues: req.body,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }).catch(err => console.error('Audit log error:', err));
      }
      return originalJson(data);
    };
    next();
  };
};
