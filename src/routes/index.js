const router = require("express").Router();
const {
  controllers: userAuthControllers,
} = require("../api/v1/auth/jobseekers");
const {
  controllers: employerAuthControllers,
} = require("../api/v1/auth/employer");
const { controllers: jobControllers } = require("../api/v1/job");
const authenticateEmployer = require("../middleware/authenticateEmployer");
const authenticateJobseeker = require("../middleware/authenticateJobseeker");

/**
 * auth routes for jobseeker
 */
router
  .post("/api/v1/auth/jobseeker-register", userAuthControllers.register)
  .post("/api/v1/auth/jobseeker-login", userAuthControllers.login);

/**
 * auth routes for employer
 */
router
  .post("/api/v1/auth/employer-register", employerAuthControllers.register)
  .post("/api/v1/auth/employer-login", employerAuthControllers.login);

/**
 * job routes for jobseekers
 */
router
  .get("/api/v1/job", authenticateJobseeker, jobControllers.findAll)
  .get("/api/v1/job/:id", authenticateJobseeker, jobControllers.findSingle);

/**
 * job routes for employers
 */
router
  .post("/api/v1/jobs", authenticateEmployer, jobControllers.create)
  .delete("/api/v1/jobs/:id", authenticateEmployer, jobControllers.deleteItem)
  .put("/api/v1/jobs/:id", authenticateEmployer, jobControllers.updateItem)
  .patch(
    "/api/v1/jobs/:id",
    authenticateEmployer,
    jobControllers.updateItemByPatch
  );

module.exports = router;
