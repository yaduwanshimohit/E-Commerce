const AuditLog = require('../models/AuditLog');

/**
 * Audit Log Service
 * Records administrative actions with Who, What, When, Old Value, and New Value.
 */
class AuditLogService {
  async logAction({ req, adminUser, action, resource, resourceId, resourceName, oldValue, newValue }) {
    try {
      const adminId = adminUser?._id || req?.user?._id;
      const adminEmail = adminUser?.email || req?.user?.email || 'system@nexcart.com';
      const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : '127.0.0.1';

      const log = await AuditLog.create({
        admin: adminId,
        adminEmail,
        action,
        resource,
        resourceId: resourceId ? String(resourceId) : undefined,
        resourceName,
        oldValue,
        newValue,
        ipAddress,
      });

      return log;
    } catch (error) {
      console.error('AuditLogService Error:', error.message);
      // Audit log failures shouldn't block main operation, but should be logged
    }
  }

  async getLogs({ page = 1, limit = 20, resource, search }) {
    const query = {};
    if (resource) {
      query.resource = resource;
    }
    if (search) {
      query.$or = [
        { adminEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { resourceName: { $regex: search, $options: 'i' } },
      ];
    }

    const count = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    return {
      logs,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      totalLogs: count,
    };
  }
}

module.exports = new AuditLogService();
