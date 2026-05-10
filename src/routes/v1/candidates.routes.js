const router = require("express").Router();
const { controllers: candidateControllers } = require("../../api/v1/candidate");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const candidateViewerRoles = ["employer", "admin", "superadmin"];

router.get(
  "/",
  authenticate,
  authorize(candidateViewerRoles),
  candidateControllers.findAll
);

router.get(
  "/:id",
  authenticate,
  authorize(candidateViewerRoles),
  candidateControllers.findSingle
);

module.exports = router;
