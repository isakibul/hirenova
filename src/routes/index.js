const router = require("express").Router();
const {
  controllers: userAuthControllers,
} = require("../api/v1/auth/jobseekers");
const {
  controllers: employerAuthControllers,
} = require("../api/v1/auth/employer");
const { controllers: jobControllers } = require("../api/v1/job");

// auth routes for jobseeker
router.post("/api/v1/auth/jobseeker-register", userAuthControllers.register);
router.post("/api/v1/auth/jobseeker-login", userAuthControllers.login);

// auth routes for employer
router.post("/api/v1/auth/employer-register", employerAuthControllers.register);
router.post("/api/v1/auth/employer-login", employerAuthControllers.login);

// routes for job
router.post("/api/v1/jobs", jobControllers.create);
router.delete("/api/v1/jobs/:id", jobControllers.deleteItem);

module.exports = router;
