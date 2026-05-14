const { AuditLog, EmailEvent } = require("../../../../model");
const requestMetrics = require("../../../../middleware/requestMetrics");
const { summarizeAuditActivity } = require("../../../../lib/observability/audit");
const {
  summarizeEmailEvents,
} = require("../../../../lib/observability/emailEvents");

const getSystemMonitorSummary = async (_req, res, next) => {
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

    const health = requestMetrics.getSnapshot();
    const alerts = [
      failedEmails24h > 0
        ? {
            type: "email_delivery",
            tone: "danger",
            message: `${failedEmails24h} email delivery failure${failedEmails24h === 1 ? "" : "s"} in the last 24 hours.`,
          }
        : null,
      recentErrors24h > 0
        ? {
            type: "api_errors",
            tone: "danger",
            message: `${recentErrors24h} server error audit event${recentErrors24h === 1 ? "" : "s"} in the last 24 hours.`,
          }
        : null,
      health.slowRequests > 0
        ? {
            type: "slow_requests",
            tone: "warning",
            message: `${health.slowRequests} slow request${health.slowRequests === 1 ? "" : "s"} observed since API start.`,
          }
        : null,
    ].filter(Boolean);

    res.status(200).json({
      data: {
        health,
        emailEvents24h,
        auditActivity24h,
        totalAuditEvents,
        failedEmails24h,
        recentErrors24h,
        alerts,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getSystemMonitorSummary;
