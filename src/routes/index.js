const router = require("express").Router();
const { controllers: authController } = require("../api/v1/auth");
const { controllers: jobControllers } = require("../api/v1/job");
const { controllers: adminControllers } = require("../api/v1/admin");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const checkUserStatus = require("../middleware/checkUserStatus");
const ownership = require("../middleware/ownership");

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
  .post(
    "/api/v1/jobs",
    authenticate,
    checkUserStatus,
    authorize(["admin", "jobseeker"]),
    jobControllers.create
  )
  .delete(
    "/api/v1/jobs/:id",
    authenticate,
    ownership("Job"),
    checkUserStatus,
    authorize(["admin", "jobseeker"]),
    jobControllers.deleteItem
  )
  .put(
    "/api/v1/jobs/:id",
    authenticate,
    ownership("Job"),
    checkUserStatus,
    authorize(["admin", "jobseeker"]),
    jobControllers.updateItem
  )
  .patch(
    "/api/v1/jobs/:id",
    authenticate,
    ownership("Job"),
    checkUserStatus,
    authorize(["admin", "jobseeker"]),
    jobControllers.updateItemByPatch
  );

/**
 * admin-only route to get all users
 */
router.get(
  "/api/v1/admin/users",
  authenticate,
  authorize(["admin"]),
  adminControllers.getAllUser
);

module.exports = router;
