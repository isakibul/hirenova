const router = require("express").Router();
const dashboardControllers = require("./controllers");
const authenticate = require("../../middleware/authenticate");

router.get("/", authenticate, dashboardControllers.getSummary);

module.exports = router;
