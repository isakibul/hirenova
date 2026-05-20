const router = require("express").Router();

const authRoutes = require("../../modules/auth/auth.routes");
const jobRoutes = require("../../modules/jobs/jobs.routes");
const adminRoutes = require("../../modules/admin/admin.routes");
const applicationRoutes = require("../../modules/applications/applications.routes");
const savedJobRoutes = require("../../modules/saved-jobs/saved-jobs.routes");
const dashboardRoutes = require("../../modules/dashboard/dashboard.routes");
const notificationRoutes = require("../../modules/notifications/notifications.routes");
const candidateRoutes = require("../../modules/candidates/candidates.routes");
const companyRoutes = require("../../modules/companies/companies.routes");
const messageRoutes = require("../../modules/messages/messages.routes");
const newsletterRoutes = require("../../modules/newsletters/newsletters.routes");
const assistantRoutes = require("../../modules/assistant/assistant.routes");
const e2eRoutes = require("./e2e.routes");

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/admin", adminRoutes);
router.use("/applications", applicationRoutes);
router.use("/saved-jobs", savedJobRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);
router.use("/candidates", candidateRoutes);
router.use("/companies", companyRoutes);
router.use("/messages", messageRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/assistant", assistantRoutes);

if (process.env.NODE_ENV === "test") {
  router.use("/e2e", e2eRoutes);
}

module.exports = router;
