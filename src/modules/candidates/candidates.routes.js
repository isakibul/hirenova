const router = require("express").Router();
const candidateControllers = require("./controllers");
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
