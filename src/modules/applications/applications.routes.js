const router = require("express").Router();
const applicationControllers = require("./controllers");
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

router.delete(
  "/:id",
  writeLimiter,
  authenticate,
  authorize(["admin", "superadmin", "employer"]),
  applicationControllers.deleteItem
);

module.exports = router;
