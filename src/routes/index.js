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
  .post("/api/v1/auth/signup", authController.register)
  .post("/api/v1/auth/login", authController.login)
  .patch("/api/v1/auth/confirm-email/:token", authController.confirmEmail)
  .patch("/api/v1/auth/forgot-password", authController.forgotPassword);

/**
 * job routes for jobseeker
 */
router
  .get("/api/v1/jobs", jobControllers.findAll)
  .get(
    "/api/v1/jobs/:id",
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
    authorize(["admin", "employer"]),
    jobControllers.create
  )
  .delete(
    "/api/v1/jobs/:id",
    authenticate,
    ownership("Job"),
    checkUserStatus,
    authorize(["admin", "employer"]),
    jobControllers.deleteItem
  )
  .put(
    "/api/v1/jobs/:id",
    authenticate,
    ownership("Job"),
    checkUserStatus,
    authorize(["admin", "employer"]),
    jobControllers.updateItem
  )
  .patch(
    "/api/v1/jobs/:id",
    authenticate,
    ownership("Job"),
    checkUserStatus,
    authorize(["admin", "employer"]),
    jobControllers.updateItemByPatch
  );

/**
 * admin-only route of users
 */
router
  .post(
    "/api/v1/admin/users",
    authenticate,
    authorize(["admin"]),
    adminControllers.addUser
  )
  .get(
    "/api/v1/admin/users",
    authenticate,
    authorize(["admin"]),
    adminControllers.getAllUser
  )
  .get(
    "/api/v1/admin/users/:id",
    authenticate,
    authorize(["admin"]),
    adminControllers.getSingleUser
  )
  .patch(
    "/api/v1/admin/users/make-admin/:id",
    authenticate,
    authorize(["admin"]),
    adminControllers.makeAdmin
  )
  .delete(
    "/api/v1/admin/users/:id",
    authenticate,
    authorize(["admin"]),
    adminControllers.removeUser
  );

module.exports = router;
