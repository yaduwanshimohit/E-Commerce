const asyncHandler = require('express-async-handler');
const auditLogService = require('../services/auditLogService');

// @desc    Get system audit logs
// @route   GET /api/audit-logs
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const resource = req.query.resource || '';
  const search = req.query.search || '';

  const data = await auditLogService.getLogs({ page, limit, resource, search });

  res.json({
    success: true,
    ...data,
  });
});

module.exports = {
  getAuditLogs,
};
