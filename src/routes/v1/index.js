const router = require("express").Router();

const authRoutes = require("./auth.routes");
const jobRoutes = require("./jobs.routes");
const adminRoutes = require("./admin.routes");

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
