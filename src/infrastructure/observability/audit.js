const { AuditLog } = require("../../model");
const hashValue = require("./hash");

const actionMap = [
  { method: "POST", pattern: /^\/api\/v1\/auth\/signup$/, action: "auth.signup" },
  { method: "POST", pattern: /^\/api\/v1\/auth\/login$/, action: "auth.login" },
  { method: "PATCH", pattern: /^\/api\/v1\/auth\/reset-password$/, action: "auth.reset_password" },
  { method: "PATCH", pattern: /^\/api\/v1\/auth\/change-password$/, action: "auth.change_password" },
  { method: "PATCH", pattern: /^\/api\/v1\/auth\/deactivate$/, action: "auth.deactivate_account" },
  { method: "POST", pattern: /^\/api\/v1\/auth\/profile\/resume$/, action: "profile.upload_resume" },
  { method: "POST", pattern: /^\/api\/v1\/auth\/profile\/resume\/parse$/, action: "profile.parse_resume" },
  { method: "POST", pattern: /^\/api\/v1\/jobs$/, action: "job.create" },
  { method: "PATCH", pattern: /^\/api\/v1\/jobs\/[^/]+$/, action: "job.update" },
  { method: "PUT", pattern: /^\/api\/v1\/jobs\/[^/]+$/, action: "job.replace" },
  { method: "DELETE", pattern: /^\/api\/v1\/jobs\/[^/]+$/, action: "job.delete" },
  { method: "PATCH", pattern: /^\/api\/v1\/jobs\/[^/]+\/status$/, action: "job.status_update" },
  { method: "PATCH", pattern: /^\/api\/v1\/jobs\/[^/]+\/approval$/, action: "job.approval_update" },
  { method: "POST", pattern: /^\/api\/v1\/jobs\/[^/]+\/apply$/, action: "application.submit" },
  { method: "PATCH", pattern: /^\/api\/v1\/applications\/[^/]+\/status$/, action: "application.status_update" },
  { method: "POST", pattern: /^\/api\/v1\/admin\/users$/, action: "admin.user_create" },
  { method: "PATCH", pattern: /^\/api\/v1\/admin\/users\/[^/]+$/, action: "admin.user_update" },
  { method: "DELETE", pattern: /^\/api\/v1\/admin\/users\/[^/]+$/, action: "admin.user_delete" },
  { method: "DELETE", pattern: /^\/api\/v1\/admin\/newsletter\/[^/]+$/, action: "admin.newsletter_delete" },
  { method: "POST", pattern: /^\/api\/v1\/messages(\/|$)/, action: "message.send_or_start" },
];

const resolveAction = (method, path) => {
  const item = actionMap.find(
    (entry) => entry.method === method && entry.pattern.test(path)
  );

  return item?.action || "";
};

const getRouteLabel = (req) => {
  if (req.baseUrl && req.route?.path) {
    return `${req.baseUrl}${req.route.path}`;
  }

  return req.path;
};

const writeAuditLog = async ({
  req,
  statusCode,
  durationMs,
  action: providedAction,
}) => {
  const action = providedAction || resolveAction(req.method, req.path);

  if (!action || statusCode >= 400) {
    return;
  }

  await AuditLog.create({
    actor: req.user?.id || req.user?._id || null,
    actorRole: req.user?.role || "anonymous",
    action,
    method: req.method,
    route: getRouteLabel(req),
    statusCode,
    targetId: req.params?.id || "",
    ipHash: hashValue(req.ip || req.headers["x-forwarded-for"] || ""),
    userAgent: String(req.headers["user-agent"] || "").slice(0, 240),
    durationMs,
  });
};

const summarizeAuditActivity = async (since) => {
  const rows = await AuditLog.aggregate([
    { $match: { createdAt: { $gte: since }, statusCode: { $lt: 400 } } },
    { $group: { _id: "$action", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 12 },
  ]);

  return rows.reduce((summary, row) => {
    summary[row._id] = row.count;
    return summary;
  }, {});
};

module.exports = {
  resolveAction,
  summarizeAuditActivity,
  writeAuditLog,
};
