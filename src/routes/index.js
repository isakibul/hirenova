const router = require("express").Router();
const {
  controllers: userAuthControllers,
} = require("../api/v1/auth/jobseekers");
const {
  controllers: employerAuthControllers,
} = require("../api/v1/auth/employer");
const { controllers: jobControllers } = require("../api/v1/job");
const authenticate = require("../middleware/authenticate");

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
 * job routes
 */
router
  .get("/api/v1/job", jobControllers.findAll)
  .get("/api/v1/job/:id", jobControllers.findSingle)
  .post("/api/v1/jobs", authenticate, jobControllers.create)
  .delete("/api/v1/jobs/:id", jobControllers.deleteItem)
  .put("/api/v1/jobs/:id", jobControllers.updateItem)
  .patch("/api/v1/jobs/:id", jobControllers.updateItemByPatch);

module.exports = router;
