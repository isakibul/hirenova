const router = require("express").Router();
const { controllers: applicationControllers } = require("../../api/v1/application");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.get(
  "/me",
  authenticate,
  authorize(["jobseeker"]),
  applicationControllers.findMine
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(["admin", "employer"]),
  applicationControllers.updateStatus
);

module.exports = router;
