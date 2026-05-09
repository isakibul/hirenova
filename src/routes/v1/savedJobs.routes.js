const router = require("express").Router();
const { controllers: savedJobControllers } = require("../../api/v1/savedJob");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.get(
  "/me",
  authenticate,
  authorize(["jobseeker"]),
  savedJobControllers.findMine
);

module.exports = router;
