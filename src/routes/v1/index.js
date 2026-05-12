const router = require("express").Router();

const authRoutes = require("./auth.routes");
const jobRoutes = require("./jobs.routes");
const adminRoutes = require("./admin.routes");
const applicationRoutes = require("./applications.routes");
const savedJobRoutes = require("./savedJobs.routes");
const dashboardRoutes = require("./dashboard.routes");
const notificationRoutes = require("./notifications.routes");
const candidateRoutes = require("./candidates.routes");
const messageRoutes = require("./messages.routes");
const newsletterRoutes = require("./newsletter.routes");

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/admin", adminRoutes);
router.use("/applications", applicationRoutes);
router.use("/saved-jobs", savedJobRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);
router.use("/candidates", candidateRoutes);
router.use("/messages", messageRoutes);
router.use("/newsletter", newsletterRoutes);

module.exports = router;
