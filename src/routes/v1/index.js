const router = require("express").Router();

const authRoutes = require("./auth.routes");
const jobRoutes = require("./jobs.routes");
const adminRoutes = require("./admin.routes");
const applicationRoutes = require("./applications.routes");
const savedJobRoutes = require("./savedJobs.routes");
const dashboardRoutes = require("./dashboard.routes");

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/admin", adminRoutes);
router.use("/applications", applicationRoutes);
router.use("/saved-jobs", savedJobRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
