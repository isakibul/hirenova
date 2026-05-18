const router = require("express").Router();

const authRoutes = require("./auth.routes");
const jobRoutes = require("./jobs.routes");
const adminRoutes = require("./admin.routes");
const applicationRoutes = require("./applications.routes");
const savedJobRoutes = require("./savedJobs.routes");
const dashboardRoutes = require("./dashboard.routes");
const notificationRoutes = require("./notifications.routes");
const candidateRoutes = require("./candidates.routes");
const companyRoutes = require("./companies.routes");
const messageRoutes = require("./messages.routes");
const newsletterRoutes = require("./newsletter.routes");
const assistantRoutes = require("./assistant.routes");
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
