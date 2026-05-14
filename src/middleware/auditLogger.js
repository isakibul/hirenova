const { writeAuditLog } = require("../lib/observability/audit");

const auditLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    void writeAuditLog({
      req,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    }).catch((error) => {
      console.error("Audit log write failed:", error.message);
    });
  });

  next();
};

module.exports = auditLogger;
