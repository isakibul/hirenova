const { AuditLog } = require("../../../../model");
const defaults = require("../../../../config/defaults");
const { getPagination } = require("../../../../utils/getPagination");

const allowedActions = [
  "auth.signup",
  "auth.login",
  "auth.reset_password",
  "auth.change_password",
  "auth.deactivate_account",
  "profile.upload_resume",
  "profile.parse_resume",
  "job.create",
  "job.update",
  "job.replace",
  "job.delete",
  "job.status_update",
  "job.approval_update",
  "application.submit",
  "application.status_update",
  "admin.user_create",
  "admin.user_update",
  "admin.user_delete",
  "admin.newsletter_delete",
  "message.send_or_start",
];

const getAuditLogs = async (req, res, next) => {
  const page = Number(req.query.page) || defaults.page;
  const limit = Math.min(Number(req.query.limit) || defaults.limit, 100);
  const action = req.query.action || "";
  const filter = allowedActions.includes(action) ? { action } : {};

  try {
    const [logs, totalItems] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "actorRole action method route statusCode targetId durationMs createdAt"
        )
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      data: logs.map((log) => ({
        id: log._id,
        actorRole: log.actorRole,
        action: log.action,
        method: log.method,
        route: log.route,
        statusCode: log.statusCode,
        targetId: log.targetId,
        durationMs: log.durationMs,
        createdAt: log.createdAt,
      })),
      pagination: getPagination({ totalItems, limit, page }),
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getAuditLogs;
