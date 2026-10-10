const router = require("express").Router();
const savedJobControllers = require("./controllers");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.get(
  "/me",
  authenticate,
  authorize(["jobseeker"]),
  savedJobControllers.findMine
);

module.exports = router;
