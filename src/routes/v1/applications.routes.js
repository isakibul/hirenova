const router = require("express").Router();
const { controllers: applicationControllers } = require("../../api/v1/application");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { writeLimiter } = require("../../middleware/rateLimits");

router.get(
  "/me",
  authenticate,
  authorize(["jobseeker"]),
  applicationControllers.findMine
);

router.patch(
  "/:id/status",
  writeLimiter,
  authenticate,
  authorize(["admin", "superadmin", "employer"]),
  applicationControllers.updateStatus
);

module.exports = router;
