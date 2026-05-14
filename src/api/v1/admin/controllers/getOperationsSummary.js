const { AuditLog, EmailEvent } = require("../../../../model");
const requestMetrics = require("../../../../middleware/requestMetrics");
const { summarizeAuditActivity } = require("../../../../lib/observability/audit");
const {
  summarizeEmailEvents,
} = require("../../../../lib/observability/emailEvents");

const getOperationsSummary = async (_req, res, next) => {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const [
      emailEvents24h,
      auditActivity24h,
      totalAuditEvents,
      failedEmails24h,
      recentErrors24h,
    ] = await Promise.all([
      summarizeEmailEvents(last24Hours),
      summarizeAuditActivity(last24Hours),
      AuditLog.countDocuments(),
      EmailEvent.countDocuments({
        status: "failed",
        createdAt: { $gte: last24Hours },
      }),
      AuditLog.countDocuments({
        statusCode: { $gte: 500 },
        createdAt: { $gte: last24Hours },
      }),
    ]);

    res.status(200).json({
      data: {
        health: requestMetrics.getSnapshot(),
        emailEvents24h,
        auditActivity24h,
        totalAuditEvents,
        failedEmails24h,
        recentErrors24h,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getOperationsSummary;
