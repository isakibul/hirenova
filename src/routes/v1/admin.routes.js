const router = require("express").Router();
const { controllers: adminControllers } = require("../../api/v1/admin");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.post(
  "/users",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.addUser
);

router.get(
  "/users",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.getAllUser
);

router.get(
  "/users/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.getSingleUser
);

router.patch(
  "/users/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.updateUser
);

router.patch(
  "/users/make-admin/:id",
  authenticate,
  authorize(["superadmin"]),
  adminControllers.makeAdmin
);

router.delete(
  "/users/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.removeUser
);

router.get(
  "/newsletter",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.getNewsletterSubscriptions
);

router.delete(
  "/newsletter/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.removeNewsletterSubscription
);

router.get(
  "/operations-summary",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.getOperationsSummary
);

router.get(
  "/audit-logs",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.getAuditLogs
);

router.get(
  "/email-events",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.getEmailEvents
);

module.exports = router;
