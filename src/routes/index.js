const router = require("express").Router();
const { controllers: authController } = require("../api/v1/auth");
const { controllers: jobControllers } = require("../api/v1/job");
const authenticate = require("../middleware/authenticate");
const checkUserStatus = require("../middleware/checkUserStatus");

/**
 * auth routes
 */
router
  .post("/api/v1/auth/register", authController.register)
  .post("/api/v1/auth/login", authController.login);

/**
 * job routes for jobseeker
 */
router
  .get("/api/v1/job", jobControllers.findAll)
  .get(
    "/api/v1/job/:id",
    authenticate,
    checkUserStatus,
    jobControllers.findSingle
  );

/**
 * job routes for employer
 */
router
  .post("/api/v1/jobs", authenticate, jobControllers.create)
  .delete("/api/v1/jobs/:id", authenticate, jobControllers.deleteItem)
  .put("/api/v1/jobs/:id", authenticate, jobControllers.updateItem)
  .patch("/api/v1/jobs/:id", authenticate, jobControllers.updateItemByPatch);

module.exports = router;
